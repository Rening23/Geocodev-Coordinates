from pyproj import CRS, Transformer
from pyproj.exceptions import ProjError


def geographic_to_utm(latitud: float, longitud: float) -> tuple[float, float, int, str]:
    """
    Transforma coordenadas geográficas (Lat, Lon) a UTM usando WGS84.
    Devuelve (este, norte, huso, hemisferio).
    """
    if not -90 <= latitud <= 90:
        raise ValueError("La latitud debe estar entre -90 y 90.")
    if not -180 <= longitud <= 180:
        raise ValueError("La longitud debe estar entre -180 y 180.")

    huso = int((longitud + 180) / 6) + 1
    hemisferio = "N" if latitud >= 0 else "S"
    epsg_code = 32600 + huso if hemisferio == "N" else 32700 + huso

    source_crs = CRS("EPSG:4326")
    target_crs = CRS(f"EPSG:{epsg_code}")
    transformer = Transformer.from_crs(source_crs, target_crs, always_xy=True)

    este, norte = transformer.transform(longitud, latitud)
    return este, norte, huso, hemisferio
