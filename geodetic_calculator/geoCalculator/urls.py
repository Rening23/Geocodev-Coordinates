from django.urls import path

from .views import (
    geographic_to_utm_view,
    utm_to_geographic_view,
    BatchGeoToUTMAPIView,
    BatchUTMToGeographicAPIView,
)

urlpatterns = [
    path("geographic_to_utm_view/", geographic_to_utm_view, name="geo_to_utm"),
    path("utm-a-geograficas/", utm_to_geographic_view, name="utm_to_geo"),
    path("batch-geo-a-utm/", BatchGeoToUTMAPIView.as_view(), name="batch_geo_to_utm"),
    path("batch-utm-a-geograficas/", BatchUTMToGeographicAPIView.as_view(), name="batch_utm_to_geo"),
]
