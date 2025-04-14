import SparkMD5 from "spark-md5";

// 计算文件MD5（使用分片处理大文件）
const calculateFileMD5 = file => {
  return new Promise(resolve => {
    const chunkSize = 2 * 1024 * 1024; // 2MB分片
    const chunks = Math.ceil(file.size / chunkSize);
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    let currentChunk = 0;

    reader.onload = async e => {
      spark.append(e.target.result);
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      reader.readAsArrayBuffer(file.slice(start, end));
    };

    loadNext();
  });
};

export { calculateFileMD5 };
