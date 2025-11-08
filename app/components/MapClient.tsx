"use client";
export default function MapClient() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.1!2d109.2548063!3d-7.4106006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMjQnMzguMiJTIDEwOcKwMTUnMTcuMyJF!5e0!3m2!1sen!2sid!4v1234567890"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
