import boto3
import os
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
from typing import Optional, Tuple
import uuid
from dotenv import load_dotenv
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
            region_name=os.environ.get('AWS_REGION', 'ap-east-2')
        )
        self.bucket_name = os.environ.get('S3_BUCKET_NAME', 'product-images')
        self.cloudfront_domain = os.environ.get('CLOUDFRONT_DOMAIN', 'cdn.example.com')
        print("DEBUG bucket:", self.bucket_name, "region:", os.environ.get('AWS_REGION'))

        
    def upload_image(
        self, 
        file_data: bytes, 
        product_id: str, 
        image_id: Optional[str] = None,
        file_extension: str = 'jpg',
        visibility: str = 'public'
    ) -> Tuple[str, int, int]:
        """
        上传图片到 S3
        
        Returns:
            Tuple[storage_key, width, height]
        """
        if not image_id:
            image_id = str(uuid.uuid4())[:8]
        
        # 构建存储路径：{product_id}/{image_id}.{ext}
        storage_key = f"{product_id}/{image_id}.{file_extension}"
        
        # 获取图片尺寸（如果需要）
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(file_data))
        width, height = img.size
        
        # 上传到 S3
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=storage_key,
                Body=file_data,
                ContentType=f'image/{file_extension}',
                Metadata={
                    'product_id': product_id,
                    'visibility': visibility
                }
            )
            return storage_key, width, height
        except ClientError as e:
            raise Exception(f"Failed to upload image to S3: {str(e)}")
    
    def delete_image(self, storage_key: str) -> bool:
        """删除 S3 中的图片"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=storage_key
            )
            return True
        except ClientError as e:
            print(f"Failed to delete image from S3: {str(e)}")
            return False
    
    def generate_url(
        self, 
        storage_key: str, 
        visibility: str = 'public',
        expires_in: int = 3600
    ) -> str:
        """
        生成 CloudFront URL
        
        Args:
            storage_key: S3 存储路径
            visibility: 'public' 或 'private'
            expires_in: 签名 URL 有效期（秒），仅对 private 有效
        
        Returns:
            CloudFront URL
        """
        if visibility == 'public':
            # 公开图片：直接返回 CloudFront URL
            return f"https://{self.cloudfront_domain}/{storage_key}"
        else:
            # 私有图片：生成 CloudFront 签名 URL
            # 注意：需要配置 CloudFront 签名密钥对
            from botocore.signers import CloudFrontSigner
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.serialization import load_pem_private_key
            from cryptography.hazmat.backends import default_backend
            from datetime import datetime, timedelta
            
            # 读取私钥（从环境变量或文件）
            private_key_path = os.environ.get('CLOUDFRONT_PRIVATE_KEY_PATH')
            if not private_key_path:
                # 过渡期：使用 S3 presigned URL
                return self._generate_s3_presigned_url(storage_key, expires_in)
            
            # CloudFront 签名 URL 生成（需要配置密钥对）
            # 这里简化处理，实际需要配置 CloudFront 密钥对
            return f"https://{self.cloudfront_domain}/private/{storage_key}?expires={int((datetime.utcnow() + timedelta(seconds=expires_in)).timestamp())}"
    
    def _generate_s3_presigned_url(self, storage_key: str, expires_in: int = 3600) -> str:
        """生成 S3 presigned URL（过渡期使用）"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': storage_key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {str(e)}")

# 单例实例
s3_service = S3Service()