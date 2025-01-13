// เพิ่มการขยายชนิดของ HTMLVideoElement
declare global {
  interface HTMLVideoElement {
    captureStream: () => MediaStream;
  }
}
