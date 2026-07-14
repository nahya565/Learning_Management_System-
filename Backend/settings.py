import os
from pathlib import Path
from django.apps import AppConfig
from collections import OrderedDict

BASE_DIR = Path(__file__).resolve().parent

SECRET_KEY = 'django-insecure-lms-project-key-sdg#$fsdfgsdf3123'
DEBUG = True
ALLOWED_HOSTS = ['*']

class DbAppConfig(AppConfig):
    name = 'settings'
    label = 'db'
    def import_models(self):
        self.models = self.apps.all_models[self.label]
        import db
        self.models_module = db

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'corsheaders',
    'settings.DbAppConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'urls'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

MIGRATION_MODULES = {
    'db': 'migrations'
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
