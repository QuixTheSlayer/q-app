import {S3Client} from "@aws-sdk/client-s3";
import {createPresignedPost} from "@aws-sdk/s3-presigned-post";

const client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  // credentials: {
  //   accessKeyId: import.meta.env.VITE_AWS_S3_KEY_ID,
  //   secretAccessKey: import.meta.env.VITE_AWS_SECRET_S3_KEY,
  // },
});


export const getAwsSignedUrl = async ({
  fileName,
  subFolder,
}: {
  fileName: string
  subFolder?: string
}) => {
  const bucketName = import.meta.env.VITE_AWS_LANDING_PAGE_BUCKET_NAME;
  const Key = `${subFolder ? subFolder + '/' : ''}${fileName}`;
//console.log('Key', Key);

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_s3_presigned_post.html

  // const Conditions = [
  //   {acl: "private"},
  //   {bucket: bucketName},
  //   ["eq", "$acl", "private"],
  // ];
  const Conditions = [
    {acl: "public-read"},
    {bucket: bucketName},
    ["eq", "$acl", "public-read"],
  ];
  
  const Fields = {
    acl: "public-read",
    // acl: 'private'
  };

  const params = {
    Bucket: bucketName,
    Key,
    Conditions,
    Fields,
    // number of seconds for which the pre-signed policy should be valid
    // Expires: 15, // 15min
  };

  try {
    const {url, fields} = await createPresignedPost(client, params);
    return {uploadUrl: url, fields};
  } catch(error) {
  //console.log(error);
  }
};



// file-upload.js
import axios, {AxiosProgressEvent} from "axios";

export const uploadToS3 = async ({
  uploadUrl,
  file,
  fields,
  onProgressChange,
}: {
  uploadUrl: string,
  file: File,
  fields: any
  onProgressChange: (percentage: number) => void
}) => {
  const formData = new FormData();

  Object.keys(fields).forEach((key) => {
    formData.append(key, fields[key]);
  });
  formData.append("file", file, file?.name);

  const parseProgress = (progressEvent: AxiosProgressEvent) => {
    const progressPercentage = (progressEvent.loaded / progressEvent.total) * 100;
    onProgressChange(progressPercentage);
  };

  const res = await axios.post(uploadUrl, formData, {
    onUploadProgress: parseProgress,
    // timeout: 1000,
    headers: {
      // Authorization: 'true'
    }
  });

  return res;
};

export default uploadToS3;
