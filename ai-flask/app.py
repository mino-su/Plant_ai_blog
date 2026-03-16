from flask import Flask, request, jsonify
from ultralytics import YOLO
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import uuid
import os
import filetype
from PIL import Image
import io
import boto3

app = Flask(__name__)
redis_host = os.environ.get('REDIS_HOST', None)
storage_uri = f"redis://{redis_host}:6379" if redis_host else "memory://"
STORAGE_MODE = os.environ.get('STORAGE_MODE', 'local')  # 'local' 또는 's3'

if STORAGE_MODE == 's3':
    AWS_S3_BUCKET = os.environ.get('AWS_S3_BUCKET')
    AWS_S3_REGION = os.environ.get('AWS_S3_REGION', 'ap-northeast-2')
    s3_boto = boto3.client('s3', region_name=AWS_S3_REGION)

#  YOLO 모델 로드,
plant_model = YOLO('/app/models/plant_best.pt')
disease_model = YOLO('/app/models/disease_best_v2.pt')
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/jpg','image/webp'}

# 보안 및 속도 제한 설정
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri= storage_uri,
)

# 이미지 저장 경로 설정
UPLOAD_FOLDER = '/app/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def validate_image(file):

    head = file.read(2048)
    file.seek(0)

    kind = filetype.guess(head)
    if kind is None or kind.mime not in ALLOWED_MIME_TYPES:
        return False, kind.mime if kind else "unknown"
    return True, kind.mime

@app.route('/health', methods=['GET'])
@limiter.exempt
def health_check():
    return jsonify({"status": "healthy"}), 200


@app.route('/detect', methods=['POST'])
@limiter.limit("10 per minute")
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "이미지가 없습니다."}), 400

    file = request.files['image']

    is_valid, mime_type = validate_image(file)
    if not is_valid:
        app.logger.warning(f"잘못된 파일 형식 시도됨: {mime_type}")
        return jsonify({"error": f"지원되지 않는 파일 형식입니다. (감지된 형식: {mime_type})"}), 400


    ext = os.path.splitext(file.filename)[1] # 원래 파일의 확장자만 추출 (.jpg 등)
    unique_filename = str(uuid.uuid4()) + ext # 고유한 이름 + 확장자 결합
    save_path = os.path.join(UPLOAD_FOLDER, unique_filename)


    # 2. 첫 번째 모델 분석
    try:

        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))

        if STORAGE_MODE == 's3':
            s3_key = f"uploads/{unique_filename}"
            s3_boto.put_object(
                Bucket = AWS_S3_BUCKET,
                Key = s3_key,
                Body = img_bytes,
                ContentType =  file.content_type
            )
            app.logger.info(f"S3 업로드 성공: {s3_key}")
        else:
            with open(save_path, 'wb') as f:
                f.write(img_bytes)

        plant_results = plant_model.predict(source=img, conf=0.2)
        plant_data = []
        for r in plant_results:
            for box in r.boxes:
                plant_data.append({
                    "label": plant_model.names[int(box.cls)],
                    "confidence": round(float(box.conf), 2)
                })
        # 신뢰도가 가장 높은 결과가 맨위(index 0)에 오도록 정렬
        plant_data = sorted(plant_data, key= lambda x: x['confidence'], reverse= True)

        # Plant 모델이 반환하는 이미지 배열을 PIL 이미지로 변환하여 저장
        plant_result_img = plant_results[0].plot()

        # 3. 두 번째 모델 분석
        disease_results = disease_model.predict(source= plant_result_img, conf=0.1)
        disease_data = []
        for r in disease_results:
            for box in r.boxes:
                disease_data.append({
                    "label": disease_model.names[int(box.cls)],
                    "confidence": round(float(box.conf), 2)
                })

        # 신뢰도가 가장 높은 결과가 맨위(index 0)에 오도록 정렬
        disease_data = sorted(disease_data, key= lambda x: x['confidence'], reverse= True)

        disease_result_img= disease_results[0].plot()


        plant_result_filename = "combined_" + unique_filename
        plant_result_save_path = os.path.join(UPLOAD_FOLDER, plant_result_filename)
        plant_img_pil = Image.fromarray(disease_result_img[..., ::-1])
        plant_img_pil.save(plant_result_save_path)


        response_data = {
            "status": "success",
            "filename": unique_filename,
            "plant_result_image": plant_result_filename,
            "results": {
                "plant_detection": plant_data,
                "disease_analysis": disease_data
            }
        }


        # 4. 통합 결과 반환
        return jsonify(response_data)

    except Exception as e:
        # 서버 내부 오류 처리
        app.logger.error(f"AI 모델 분석 중 오류: {str(e)}")
        return jsonify({
            "status": "FAILED",
            "error": "AI 모델 분석 중 오류가 발생했습니다."
        }), 500



if __name__ == '__main__':
    # Flask 기본 포트는 5000번입니다.
    app.run(host='0.0.0.0', port=5000)