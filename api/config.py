from typing import List

class Settings:
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AgriSense API"
    
    # CORS Origins for development
    # Note: "*" is used here for development purposes to allow Expo/React Native 
    # to connect from any LAN IP. In a production environment, this should be 
    # restricted to specific domains.
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
