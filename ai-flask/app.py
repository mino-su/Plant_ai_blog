from flask import Flask, request, jsonify
from ultralytics import YOLO
from werkzeug.utils import secure_filename
import uuid
import os

app = Flask(__name__)

#  YOLO 모델 로드,
plant_model = YOLO('plant_best.pt')
disease_model = YOLO('disease_best_v2.pt')


# 이미지 저장 경로 설정
UPLOAD_FOLDER = '../uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "이미지가 없습니다."}), 400

    file = request.files['image']

    ext = os.path.splitext(file.filename)[1] # 원래 파일의 확장자만 추출 (.jpg 등)
    unique_filename = str(uuid.uuid4()) + ext # 고유한 이름 + 확장자 결합
    save_path = os.path.join(UPLOAD_FOLDER, unique_filename)


    # 2. 첫 번째 모델 분석
    try:
        plant_results = plant_model.predict(source=save_path, conf=0.2)
        plant_data = []
        for r in plant_results:
            for box in r.boxes:
                plant_data.append({
                    "label": plant_model.names[int(box.cls)],
                    "confidence": round(float(box.conf), 2)
                })
        # 신뢰도가 가장 높은 결과가 맨위(index 0)에 오도록 정렬
        plant_data = sorted(plant_data, key= lambda x: x['confidence'], reverse= True)

        # 3. 두 번째 모델 분석
        disease_results = disease_model.predict(source=save_path, conf=0.1)
        disease_data = []
        for r in disease_results:
            for box in r.boxes:
                disease_data.append({
                    "label": disease_model.names[int(box.cls)],
                    "confidence": round(float(box.conf), 2)
                })

        # 신뢰도가 가장 높은 결과가 맨위(index 0)에 오도록 정렬
        disease_data = sorted(disease_data, key= lambda x: x['confidence'], reverse= True)

        response_data = {
            "status": "success",
            "filename": unique_filename,
            "results": {
                "plant_detection": plant_data,
                "disease_analysis": disease_data
            }
        }


        # 4. 통합 결과 반환
        return jsonify(response_data)

    except Exception as e:
        # 서버 내부 오류 처리
        return jsonify({
            "status": "FAILED",
            "error": str(e)

        }), 500



if __name__ == '__main__':
    # Flask 기본 포트는 5000번입니다.
    app.run(host='0.0.0.0', port=5000)