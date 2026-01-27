from pyproj import Transformer, CRS

def utm_to_geographic(este: float, norte: float, huso: int, hemisferio: str) -> tuple[float, float]:
    """
    Transforma coordenadas UTM a geográficas (Latitud, Longitud) usando WGS84.

    Args:
        este (float): Coordenada Este (Easting).
        norte (float): Coordenada Norte (Northing).
        huso (int): El huso o zona UTM (ej. 30).
        hemisferio (str): El hemisferio ('N' para Norte, 'S' para Sur).

    Returns:
        tuple[float, float]: Una tupla conteniendo (latitud, longitud).
        
    Raises:
        ValueError: Si el hemisferio o los parámetros son inválidos.
        ProjError: Si las coordenadas no son válidas para el huso especificado.
    """
    hemisferio = hemisferio.upper()
    if hemisferio not in ['N', 'S']:
        raise ValueError("El hemisferio debe ser 'N' o 'S'.")

    # Construye el código EPSG para el sistema de coordenadas UTM de origen
    # 32600 para el Norte, 32700 para el Sur
    epsg_code = 32600 + huso if hemisferio == 'N' else 32700 + huso
    
    source_crs = CRS(f"EPSG:{epsg_code}")
    target_crs = CRS("EPSG:4326") # WGS84 Geográficas

    # Crea el transformador
    transformer = Transformer.from_crs(source_crs, target_crs, always_xy=False)
    
    # Realiza la transformación
    # El orden por defecto de pyproj para EPSG:4326 es (latitud, longitud)
    latitud, longitud = transformer.transform(este, norte)
    
    return latitud, longitud
