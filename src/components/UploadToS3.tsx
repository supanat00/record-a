import { useState } from "react";
import { S3 } from "aws-sdk";

const s3 = new S3({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export default function UploadToS3() {
  const [file, setFile]: any = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setIsUploading(true);

    try {
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: `test/${file.name}`,
        Body: file,
        ContentType: file.type,
      };
    
      try {
        const result = await s3.upload(uploadParams).promise();
        console.log("File uploaded successfully:", result);
      } catch (err) {
        console.error("Error uploading file:", err);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1>Upload File to S3</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}