from flask import Flask, request, jsonify
from ultralytics import YOLO
import os

app = Flask(__name__)

# 1. YOLO 모델 로드 (점심 후에 할 Custom 모델 경로를 여기에 넣을 거예요)
# 일단 기본 제공 모델인 yolov8n.pt를 사용해봅시다.
model = YOLO('yolov8n.pt')

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    # 이미지를 임시 저장하거나 바로 처리
    file.save("temp.jpg")

    # 2. YOLO 추론
    results = model.predict(source="temp.jpg", save=False)

    # 3. 결과 파싱 (간단 예시)
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "class": model.names[int(box.cls)],
                "confidence": float(box.conf)
            })

    return jsonify({"detections": detections})

if __name__ == '__main__':
    # Flask 기본 포트는 5000번입니다.
    app.run(host='0.0.0.0', port=5000, debug=True)