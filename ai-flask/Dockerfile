FROM python:3.9-slim

WORKDIR /app

# [작동 원리]
# 1. libgl1: OpenCV와 YOLO가 이미지 연산을 할 때 필요한 핵심 엔진입니다.
# 2. libglib2.0-0: 파이썬이 시스템 레벨의 다양한 기능을 쓸 때 필요한 기본 도구입니다.
# 이 두 개만 있으면 어떤 버전의 OpenCV가 깔려도 에러가 나지 않습니다.
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# [주의] 모델 파일과 app.py가 같은 위치에 있어야 합니다.
# 만약 ai-flask 폴더 안에 모델 파일들이 있다면 이대로 가시면 됩니다.

EXPOSE 5000

CMD ["python", "app.py"]