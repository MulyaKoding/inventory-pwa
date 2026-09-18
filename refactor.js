const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filePath, content);
}

const gradient160 = /bg-\[linear-gradient\(160deg,#060b1a_0%,#0c1733_30%,#0f2050_60%,#1e3a8a_100%\)\]/g;
const gradient160Replace = 'bg-[linear-gradient(160deg,#f8fafc_0%,#f1f5f9_30%,#e2e8f0_60%,#cbd5e1_100%)]';

const gradient145 = /bg-\[linear-gradient\(145deg,#060b1a,#0c1733,#1e3a8a\)\]/g;
const gradient145Replace = 'bg-[linear-gradient(145deg,#f8fafc,#f1f5f9,#cbd5e1)]';

const gradient135 = /bg-\[linear-gradient\(135deg,#050a14_0%,#0c1733_50%,#080d1f_100%\)\]/g;
const gradient135Replace = 'bg-[linear-gradient(135deg,#f8fafc_0%,#f1f5f9_50%,#e2e8f0_100%)]';

const navScrolled = /bg-\[rgba\(8,12,24,\.96\)\] backdrop-blur-\[18px\] shadow-\[0_1px_0_rgba\(255,255,255,\.06\),0_4px_20px_rgba\(0,0,0,\.4\)\]/g;
const navScrolledReplace = 'bg-[rgba(255,255,255,.96)] backdrop-blur-[18px] shadow-[0_1px_0_rgba(0,0,0,.06),0_4px_20px_rgba(0,0,0,.08)]';
const navScrolled2 = /bg-\[rgba\(8,12,24,0\.96\)\] backdrop-blur-\[18px\] shadow-\[0_1px_0_rgba\(255,255,255,0\.06\),0_4px_20px_rgba\(0,0,0,0\.4\)\]/g;
const navScrolled2Replace = 'bg-[rgba(255,255,255,0.96)] backdrop-blur-[18px] shadow-[0_1px_0_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.08)]';

const whiteToDarkText = (str) => {
    return str
        .replace(/text-white\/70/g, 'text-slate-600')
        .replace(/text-white\/90/g, 'text-slate-700')
        .replace(/text-white\/80/g, 'text-slate-600')
        .replace(/text-white\/75/g, 'text-slate-600')
        .replace(/text-white\/83/g, 'text-slate-700')
        .replace(/text-white\/85/g, 'text-slate-700')
        .replace(/text-white\/45/g, 'text-slate-500')
        .replace(/text-white\/35/g, 'text-slate-500')
        .replace(/text-white\/30/g, 'text-slate-400')
        .replace(/text-white\/40/g, 'text-slate-500')
        .replace(/text-white\/50/g, 'text-slate-500')
        .replace(/text-white/g, 'text-slate-900')
        .replace(/bg-white\/8/g, 'bg-black/5')
        .replace(/bg-white\/5/g, 'bg-black/5')
        .replace(/bg-white\/10/g, 'bg-black/5')
        .replace(/bg-white\/12/g, 'bg-black/5')
        .replace(/bg-white\/20/g, 'bg-black/10')
        .replace(/bg-black\/20/g, 'bg-white/40')
        .replace(/bg-black\/25/g, 'bg-white/40')
        .replace(/border-white\/10/g, 'border-slate-300')
        .replace(/border-white\/12/g, 'border-slate-300')
        .replace(/border-white\/15/g, 'border-slate-300')
        .replace(/border-white\/18/g, 'border-slate-300')
        .replace(/border-white\/20/g, 'border-slate-300')
        .replace(/border-white\/22/g, 'border-slate-400')
        .replace(/border-white\/8/g, 'border-slate-200')
        .replace(/rgba\(8,14,36,\.85\)/g, 'rgba(255,255,255,.85)')
        .replace(/rgba\(8,14,36,0\.85\)/g, 'rgba(255,255,255,0.85)')
        .replace(/rgba\(255,255,255,\.025\)/g, 'rgba(0,0,0,.025)')
        .replace(/rgba\(255,255,255,0\.025\)/g, 'rgba(0,0,0,0.025)')
        .replace(/rgba\(255,255,255,\.03\)/g, 'rgba(0,0,0,.03)')
        .replace(/rgba\(255,255,255,0\.03\)/g, 'rgba(0,0,0,0.03)')
        .replace(/rgba\(255,255,255,\.06\)/g, 'rgba(0,0,0,.06)')
}

// about hero
let ah = fs.readFileSync('app/(app)/about/_components/AboutHero.tsx', 'utf8');
ah = ah.replace(gradient160, gradient160Replace);
ah = whiteToDarkText(ah);
ah = ah.replace(/bg-brand-500 text-slate-900/g, 'bg-brand-500 text-white'); // keep button text white
fs.writeFileSync('app/(app)/about/_components/AboutHero.tsx', ah);

// about navbar
let an = fs.readFileSync('app/(app)/about/_components/AboutNavbar.tsx', 'utf8');
an = an.replace(navScrolled2, navScrolled2Replace);
an = whiteToDarkText(an);
an = an.replace(/bg-brand-500 text-slate-900/g, 'bg-brand-500 text-white');
an = an.replace(/text-slate-900 font-extrabold text-\[11px\]/g, 'text-white font-extrabold text-[11px]');
fs.writeFileSync('app/(app)/about/_components/AboutNavbar.tsx', an);

// about contact
let ac = fs.readFileSync('app/(app)/about/_components/AboutContact.tsx', 'utf8');
ac = ac.replace(gradient145, gradient145Replace);
ac = whiteToDarkText(ac);
fs.writeFileSync('app/(app)/about/_components/AboutContact.tsx', ac);

// about footer
let af = fs.readFileSync('app/(app)/about/_components/AboutFooter.tsx', 'utf8');
af = af.replace(gradient135, gradient135Replace);
af = whiteToDarkText(af);
fs.writeFileSync('app/(app)/about/_components/AboutFooter.tsx', af);

// home page
let hp = fs.readFileSync('app/(app)/(home)/page.tsx', 'utf8');
hp = hp.replace(gradient160, gradient160Replace);
hp = hp.replace(gradient145, gradient145Replace);
hp = hp.replace(gradient135, gradient135Replace);
hp = hp.replace(navScrolled, navScrolledReplace);
hp = whiteToDarkText(hp);
hp = hp.replace(/bg-brand-500 text-slate-900/g, 'bg-brand-500 text-white');
hp = hp.replace(/text-slate-900 font-black text-xs/g, 'text-white font-black text-xs'); // Logo INV
hp = hp.replace(/text-slate-900 font-extrabold text-\[11px\]/g, 'text-white font-extrabold text-[11px]');
fs.writeFileSync('app/(app)/(home)/page.tsx', hp);
