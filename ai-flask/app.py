from flask import Flask, request, jsonify
from ultralytics import YOLO
import os

app = Flask(__name__)

#  YOLO 모델 로드
plant_model = YOLO('plant_best.pt')
disease_model = YOLO('disease_best.pt')


# 이미지 저장 경로 설정
UPLOAD_FOLDER = '../uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "이미지가 없습니다."}), 400

    file = request.files['image']

    # uuid를 통해 고유 파일명 생성

    filename = file.filename
    save_path = os.path.join(UPLOAD_FOLDER, filename)

    # 파일 저장
    file.save(save_path)


    # 2. 첫 번째 모델 분석
    plant_results = plant_model.predict(source=save_path, conf=0.1, save=True)
    plant_data = []
    for r in plant_results:
        for box in r.boxes:
            plant_data.append({
                "label": plant_model.names[int(box.cls)],
                "confidence": round(float(box.conf), 2)
            })

    # 3. 두 번째 모델 분석
    disease_results = disease_model.predict(source=save_path, conf=0.1, save=True)
    disease_data = []
    for r in disease_results:
        for box in r.boxes:
            disease_data.append({
                "label": disease_model.names[int(box.cls)],
                "confidence": round(float(box.conf), 2)
            })

    # 4. 통합 결과 반환
    return jsonify({
        "status": "success",
        "filename": filename,
        "results": {
            "plant_detection": plant_data,
            "disease_analysis": disease_data
        }
    })




if __name__ == '__main__':
    # Flask 기본 포트는 5000번입니다.
    app.run(host='0.0.0.0', port=5000, debug=True)