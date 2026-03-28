import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace gray occurrences mapped to slate
    content = content.replace(/text-gray-400/g, 'text-slate-500');
    content = content.replace(/text-gray-500/g, 'text-slate-500');
    content = content.replace(/text-gray-300/g, 'text-slate-600');
    
    content = content.replace(/bg-gray-800\/50/g, 'bg-slate-100');
    content = content.replace(/bg-gray-800/g, 'bg-slate-100');
    content = content.replace(/bg-gray-900/g, 'bg-slate-50');
    
    content = content.replace(/border-gray-800/g, 'border-slate-200');
    content = content.replace(/border-gray-700/g, 'border-slate-200');
    content = content.replace(/border-gray-600/g, 'border-slate-300');
    content = content.replace(/border-gray-500/g, 'border-slate-400');
    
    // Replace text-white where it's likely a main text (active states might need text-slate-900 contextually, but changing commonly)
    // For specific cases like Sidebar, Toolbar, LayerManager where we had `text-white` for active/header text:
    // We already fixed text-white on body. 
    // In Toolbar, `text-white` is used when active over `bg-primary`, which is fine.
    // In Sidebar, `hover:text-white` -> `hover:text-slate-900`
    content = content.replace(/hover:text-white/g, 'hover:text-slate-900');
    // LayerManager uses `text-white` for active layers which have `bg-secondary/10` (light pink). Dark text is better there.
    content = content.replace(/text-white/g, 'text-slate-800');
    
    // Restore text-white for buttons where it should actually be white
    content = content.replace(/btn-primary(.*?)text-slate-800/g, 'btn-primary$1text-white');
    content = content.replace(/bg-primary(.*?)text-slate-800/g, 'bg-primary$1text-white');
    content = content.replace(/bg-secondary(.*?)text-slate-800/g, 'bg-secondary$1text-white');
    content = content.replace(/bg-black\/60(.*?)text-slate-800/g, 'bg-black/60$1text-white');
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Colors replaced!');
