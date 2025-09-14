// src/components/Footer.js

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white text-sm py-6 mt-8">
      <div className="max-w-4xl mx-auto px-4 space-y-1">
        <p>CHRIST (Deemed to be University)</p>
        <p>Dharmaram College Post, Hosur Road, Bengaluru – 560029, Karnataka, India</p>
        <p>Tel: +91 80 4012 9100 / 9600 | Fax: 40129000</p>
        <p>Email: <a href="mailto:mail@christuniversity.in" className="underline">mail@christuniversity.in</a></p>
        <p>Website: <a href="https://www.christuniversity.in" target="_blank" rel="noopener noreferrer" className="underline">christuniversity.in</a></p>
        <p className="mt-2">&copy; {new Date().getFullYear()} CHRIST (Deemed to be University). All Rights Reserved.</p>
      </div>
    </footer>
  );
}
