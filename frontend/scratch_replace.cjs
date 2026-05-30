const fs = require('fs');
const files = [
  'src/pages/Login.jsx',
  'src/pages/Signup.jsx',
  'src/pages/ResetPassword.jsx',
  'src/components/Features.jsx',
  'src/components/LiveDemo.jsx',
  'src/components/HowItWorks.jsx',
  'src/components/Hero.jsx',
  'src/components/Footer.jsx',
  'src/App.jsx'
];

files.forEach(f => {
  let p = 'd:/Projects/ReFitly/frontend/' + f;
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  
  c = c.replace(/text-\[#1e3a40\]/g, (match, offset, string) => {
    let lineStart = string.lastIndexOf('\n', offset);
    let lineEnd = string.indexOf('\n', offset);
    if (lineEnd === -1) lineEnd = string.length;
    let line = string.substring(lineStart, lineEnd);
    if (line.includes('bg-primary') || line.includes('bg-primary-hover')) {
      return 'text-white';
    }
    return 'text-primary-dark';
  });
  
  c = c.replace(/color: '#1e3a40'/g, "color: '#1A1A1A'");
  fs.writeFileSync(p, c);
});
console.log('Replaced successfully.');
