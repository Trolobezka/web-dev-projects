document.getElementById("submit").addEventListener("click", () => {
    let z = document.getElementsByName("z")[0].value;
    let d_a0 = document.getElementsByName("d_a0")[0].value;
    let alfa = document.getElementsByName("alfa")[0].value;
    let beta = document.getElementsByName("beta")[0].value;
    let rada2 = document.getElementsByName("rada2")[0].checked;

    let moduly1 = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 12.0, 16.0, 20.0, 25.0, 32.0, 40.0, 50.0];
    let moduly2 = [0.14, 0.18, 0.22, 0.28, 0.35, 0.45, 0.55, 0.7, 0.9, 1.125, 1.375, 1.75, 2.25, 2.75, 3.5, 4.5, 5.5, 7.0, 9.0, 11.0, 14.0, 18.0, 22.0, 28.0, 35.0, 45.0, 55.0];

    const deg2rad = (x) => Math.PI * x / 180;
    const rad2deg = (x) => 180 * x / Math.PI;
    const roundN = (x, n) => Math.round(Math.pow(10, n) * x) / Math.pow(10, n);

    let alfa_r = deg2rad(alfa);
    let beta_r = deg2rad(beta);
    let m_n_nenorm = d_a0 / ((z / Math.cos(beta_r)) + 2);

    let moduly = moduly1.slice();
    moduly = rada2 ? moduly.concat(moduly2) : moduly;
    let vhodne_moduly = moduly.sort((a, b) => a - b).filter(x => x >= m_n_nenorm);
    let m_n = vhodne_moduly.length > 0 ? vhodne_moduly[0] : m_n_nenorm;

    let m_t = m_n / Math.cos(beta_r);
    let d = m_t * z;
    let d_a = d + 2 * m_n;
    let d_f = d - 2.5 * m_n;
    let alfa_t_r = Math.atan(Math.tan(alfa_r) / Math.cos(beta_r));
    let alfa_t = rad2deg(alfa_t_r);
    let d_b = d * Math.cos(alfa_t_r);
    
    let vysledky = "";
    vysledky += `Počet zubů z = ${z}\n`;
    vysledky += `Původní průměr hlavové kružnice d_a0 = ${d_a0} mm\n`;
    vysledky += `Úhel záběru alfa = ${alfa} °\n`;
    vysledky += `Úhel sklonu boku zubů beta = ${beta} °\n`;
    vysledky += `Původní modul m_n_nenorm = ${roundN(m_n_nenorm, 3)} mm\n`;
    vysledky += `Normalizovaný modul m_n = ${roundN(m_n, 3)} mm\n`;
    vysledky += `Modul v čelní rovině m_t = ${roundN(m_t, 3)} mm\n`;
    vysledky += `Průměr roztečné kružnice d = ${roundN(d, 3)} mm\n`;
    vysledky += `Průměr hlavové kružnice d_a = ${roundN(d_a, 3)} mm\n`;
    vysledky += `Průměr patní kružnice d_f = ${roundN(d_f, 3)} mm\n`;
    vysledky += `Úhel záběru v čelní rovině alfa_t = ${roundN(alfa_t, 3)} °\n`;
    vysledky += `Průměr základní kružnice d_b = ${roundN(d_b, 3)} mm`;

    document.getElementsByName("vysledky")[0].value = vysledky;

    let config = "";
    config += String.raw`\newcommand{\xxxZ}{${z}}` + "\n";
    config += String.raw`\newcommand{\xxxDAnn}{${d_a0}}` + "\n";
    config += String.raw`\newcommand{\xxxALPHA}{${alfa}}` + "\n";
    config += String.raw`\newcommand{\xxxBETA}{${beta}}` + "\n";
    config += String.raw`\newcommand{\xxxMNnn}{${roundN(m_n_nenorm, 3)}}` + "\n";
    config += String.raw`\newcommand{\xxxMN}{${m_n}}` + "\n";
    config += String.raw`\newcommand{\xxxMT}{${roundN(m_t, 3)}}` + "\n";
    config += String.raw`\newcommand{\xxxD}{${roundN(d, 3)}}` + "\n";
    config += String.raw`\newcommand{\xxxDA}{${roundN(d_a, 3)}}` + "\n";
    config += String.raw`\newcommand{\xxxDF}{${roundN(d_f, 3)}}` + "\n";
    config += String.raw`\newcommand{\xxxALPHAT}{${roundN(alfa_t, 3)}}` + "\n";
    config += String.raw`\newcommand{\xxxDB}{${roundN(d_b, 3)}}`;

    let tex = TEX.replace(String.raw`\include{config}`, config);
    document.getElementsByName("tex")[0].value = tex;
});