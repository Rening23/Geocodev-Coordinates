from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
import pandas as pd
from pyproj.exceptions import ProjError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework import status

from .serializers import FileUploadSerializer
from .geographic_to_utm import geographic_to_utm
from .utm_to_geographic import utm_to_geographic


def _parse_json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        raise ValueError("Cuerpo JSON inválido.")


@csrf_exempt
def geographic_to_utm_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Este endpoint solo acepta POST."}, status=405)

    try:
        if (request.content_type or "").startswith("application/json"):
            data = _parse_json_body(request)
            latitud = float(data.get("latitud"))
            longitud = float(data.get("longitud"))
        else:
            latitud = float(request.POST.get("latitud_decimal"))
            longitud = float(request.POST.get("longitud_decimal"))

        este, norte, huso, hemisferio = geographic_to_utm(latitud, longitud)
        return JsonResponse(
            {"este": este, "norte": norte, "huso": huso, "hemisferio": hemisferio},
            status=200,
        )
    except (TypeError, ValueError, ProjError) as exc:
        return JsonResponse({"error": f"Parámetros inválidos. Detalles: {exc}"}, status=400)


class BatchGeoToUTMAPIView(APIView):
    """Transforma por lote coordenadas geográficas a UTM desde CSV o Excel."""

    parser_classes = [MultiPartParser]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.validated_data["file"]

        try:
            if uploaded_file.name.endswith(".csv"):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith((".xls", ".xlsx")):
                df = pd.read_excel(uploaded_file)
            else:
                return Response(
                    {"error": "Formato de archivo no soportado. Use CSV o Excel."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as exc:
            return Response(
                {"error": f"No se pudo leer el archivo. Detalles: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "latitud" not in df.columns or "longitud" not in df.columns:
            return Response(
                {"error": "El archivo debe contener las columnas 'latitud' y 'longitud'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = []
        for _, row in df.iterrows():
            try:
                lat = float(row["latitud"])
                lon = float(row["longitud"])
                este, norte, huso, hemisferio = geographic_to_utm(lat, lon)
                results.append(
                    {
                        "este": este,
                        "norte": norte,
                        "huso": huso,
                        "hemisferio": hemisferio,
                    }
                )
            except (ValueError, TypeError, ProjError) as exc:
                results.append(
                    {
                        "este": "ERROR",
                        "norte": f"{exc}",
                        "huso": "ERROR",
                        "hemisferio": "ERROR",
                    }
                )

        results_df = pd.DataFrame(results)
        df[["este", "norte", "huso", "hemisferio"]] = results_df

        output_filename = f"utm_{uploaded_file.name}"
        if uploaded_file.name.endswith(".csv"):
            response = HttpResponse(content_type="text/csv")
            df.to_csv(path_or_buf=response, index=False, decimal=".")
        else:
            response = HttpResponse(
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            df.to_excel(response, index=False)

        response["Content-Disposition"] = f"attachment; filename=\"{output_filename}\""
        return response


@csrf_exempt
def utm_to_geographic_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Este endpoint solo acepta POST."}, status=405)

    try:
        data = _parse_json_body(request)
        este = float(data.get("este"))
        norte = float(data.get("norte"))
        huso = int(data.get("huso"))
        hemisferio = data.get("hemisferio")

        if hemisferio is None:
            raise ValueError("El parámetro 'hemisferio' es obligatorio.")

        latitud, longitud = utm_to_geographic(este, norte, huso, hemisferio)
        return JsonResponse({"latitud": latitud, "longitud": longitud}, status=200)
    except ValueError as exc:
        return JsonResponse({"error": f"Parámetros inválidos. Detalles: {exc}"}, status=400)
    except ProjError as exc:
        return JsonResponse(
            {
                "error": "Error en la proyección de coordenadas. Revisa que los valores sean correctos.",
                "detalles": f"{exc}",
            },
            status=400,
        )


class BatchUTMToGeographicAPIView(APIView):
    """Transforma por lote UTM a geográficas desde CSV o Excel."""

    parser_classes = [MultiPartParser]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.validated_data["file"]

        try:
            if uploaded_file.name.endswith(".csv"):
                df = pd.read_csv(uploaded_file)
            elif uploaded_file.name.endswith((".xls", ".xlsx")):
                df = pd.read_excel(uploaded_file)
            else:
                return Response(
                    {"error": "Formato de archivo no soportado. Use CSV o Excel."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as exc:
            return Response(
                {"error": f"No se pudo leer el archivo. Detalles: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = []
        for _, row in df.iterrows():
            try:
                este = float(row.get("este"))
                norte = float(row.get("norte"))
                huso = int(row.get("huso"))
                hemisferio = row.get("hemisferio")

                lat, lon = utm_to_geographic(este, norte, huso, hemisferio)
                results.append({"latitud": lat, "longitud": lon})
            except (ValueError, TypeError, ProjError) as exc:
                results.append({"latitud": "ERROR", "longitud": f"{exc}"})

        results_df = pd.DataFrame(results)
        df["latitud"] = results_df["latitud"]
        df["longitud"] = results_df["longitud"]

        output_filename = f"transformadas_{uploaded_file.name}"
        if uploaded_file.name.endswith(".csv"):
            response = HttpResponse(content_type="text/csv")
            df.to_csv(path_or_buf=response, index=False)
        else:
            response = HttpResponse(
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            df.to_excel(response, index=False)

        response["Content-Disposition"] = f"attachment; filename=\"{output_filename}\""
        return response
