declare module 'dompurify' {
  const DOMPurify: { sanitize: (html: string) => string };
  export default DOMPurify;
}
