const TEX = String.raw`% LaTeX
\documentclass{article}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{lmodern}
\usepackage[english,czech]{babel}
\usepackage{csquotes}
\usepackage{icomma}
\usepackage[left=2cm,right=2cm,top=2cm,bottom=2cm]{geometry}
\usepackage{amsmath,amssymb,amsfonts,amsthm}
\usepackage{graphicx}

\include{config}

\begin{document}
\begin{titlepage}
    \begin{center}
        \LARGE\textbf{ÚSTAV KONSTRUOVÁNÍ A ČÁSTÍ STROJŮ}\\
        \Huge\textbf{Strojírenské konstruování II.}\\
        \vspace{5cm}
        \textbf{Výpočet parametrů ozubeného kola\\TECHNICKÁ ZPRÁVA}
        \vfill
    \end{center}
    \large
    Rok: ...\\
    Vypracoval/a: ...\\
    Číslo zadání: ...
\end{titlepage}

\pagenumbering{roman}
\setcounter{page}{1}
\tableofcontents
\newpage

\pagenumbering{arabic}
\section{Úvod}
...
\section{Výpočet parametrů čelního ozubeného kola\\s přímými nebo šikmými zuby}
\subsection{Naměřené hodnoty}
Naměřené hodnoty ozubeného kola:
\begin{itemize}
    \item počet zubů na ozubeném kole $z=\xxxZ$
    \item rozměr hlavové kružnice $d_a'=\xxxDAnn$ mm
    \item úhel záběru $\alpha=\xxxALPHA^\circ$
    \item úhel sklonu boku zubů $\beta=\xxxBETA^\circ$
\end{itemize}
\subsection{Vypočtené hodnoty}
Velikost modulu $m_n'$ je:
$$
m_n'=\frac{d_a'}{\frac{z}{\cos\beta}+2} = \frac{\xxxDAnn}{\frac{\xxxZ}{\cos\xxxBETA}+2} \doteq \xxxMNnn \,\,[mm].
$$
Velikost modulu $m_n$ je:
$$
m_n = \xxxMN \,\,[mm]
$$
Velikost modulu v čelní rovině $m_t$ je:
$$
m_t=\frac{m_n}{\cos\beta}=\frac{\xxxMN}{\cos\,\xxxBETA^\circ} \doteq \xxxMT \,\,[mm].
$$
Velikost roztečné kružnice $d$ je:
$$
d = m_t \cdot z = \xxxMT \cdot \xxxZ \doteq \xxxD \,\, [mm].
$$
Velikost hlavové kružnice $d_a$ je:
$$
d_a = d + 2\cdot m_n = \xxxD + 2\cdot\xxxMN \doteq \xxxDA \,\, [mm].
$$
Velikost patní kružnice $d_f$ je: 
$$
d_f = d - 2,5\cdot m_n = \xxxD - 2,5\cdot\xxxMN \doteq \xxxDF \,\,[mm].
$$
Velikost úhlu záběru $\alpha_t$ je:
$$
\alpha_t =\arctan\frac{\tan\, \alpha}{\cos\, \beta} = \arctan\frac{\tan\, \xxxALPHA^\circ}{\cos\, \xxxBETA^\circ} \doteq \xxxALPHAT^\circ \,\,[mm].
$$
Velikost základní kružnice $d_b$ je:
$$
d_b = d\cdot \cos\alpha_t = d\cdot \cos\, \xxxALPHAT^\circ \doteq \xxxDB \,\,[mm].
$$
\section{Závěr}
...
\end{document}
`