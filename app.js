/* ============================================================
   A.H.D Marca Sports - app.js
   OJO: esta es una versión de práctica para GitHub Pages.
   Los datos viven en el navegador, así que NO es seguridad real.
   Para producción, mueve afiliados y cursos a un servidor/base
   de datos (Firebase, Supabase, etc.).
   ============================================================ */

// 1) AFILIADOS: guardamos el hash SHA-256 de la cédula, no la cédula.
//    Para agregar uno: calcula el hash (ver instrucciones al final).
const AFILIADOS = [
  { hash: "179b1a3e9e319cff0ca6671e07a62dad7d087b0f2a89eef0202612c3cb46baf9", nombre: "Carlos Ramírez", perfil: "Entrenador deportivo", desde: 2022 },
  { hash: "1fd0fe42943e8e2a09d0083dd19d2f379b816cf0a79bd30bf40c5dbff92d52eb", nombre: "Dra. Lucía Herrera", perfil: "Médica del deporte", desde: 2021 },
  { hash: "ea50b632625c004f9c48b0f733c34e84ece96828ac76dad5f363b8f360b89a06", nombre: "Andrés Mejía", perfil: "Periodista deportivo", desde: 2023 }
];

// 2) CURSOS: "para" indica a qué perfiles va dirigido ("todos" = cualquiera).
const CURSOS = [
  { id: 1, titulo: "Planificación del entrenamiento", para: ["Entrenador deportivo"], horas: 20, desc: "Macrociclos, cargas y control del rendimiento.", enlace: "#" },
  { id: 2, titulo: "Lesiones deportivas frecuentes", para: ["Médica del deporte", "Fisioterapeuta"], horas: 16, desc: "Diagnóstico, tratamiento y prevención.", enlace: "#" },
  { id: 3, titulo: "Rehabilitación y retorno al juego", para: ["Fisioterapeuta", "Médica del deporte"], horas: 12, desc: "Protocolos para volver a competir sin recaídas.", enlace: "#" },
  { id: 4, titulo: "Ética y periodismo deportivo", para: ["Periodista deportivo"], horas: 10, desc: "Cobertura responsable y manejo de fuentes.", enlace: "#" },
  { id: 5, titulo: "Primeros auxilios en el deporte", para: ["todos"], horas: 8, desc: "Reanimación y manejo de emergencias en cancha.", enlace: "#" },
  { id: 6, titulo: "Nutrición para el rendimiento", para: ["todos"], horas: 14, desc: "Alimentación e hidratación según la disciplina.", enlace: "#" }
];

const EVENTOS = [
  { titulo: "Congreso Hispanoamericano del Deporte", fecha: "Por confirmar", lugar: "Virtual" },
  { titulo: "Taller de fisioterapia aplicada", fecha: "Por confirmar", lugar: "Cali" }
];

const NOTICIAS = [
  { titulo: "Bienvenidos a la nueva página de la A.H.D", texto: "Ahora puedes acceder a tus cursos con tu cédula." },
  { titulo: "Nuevos cursos disponibles", texto: "Revisa la pestaña Mis cursos para ver lo último." }
];

// ---------- Utilidades ----------
const $ = (id) => document.getElementById(id);

async function sha256(texto) {
  const datos = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest("SHA-256", datos);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function escapar(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}

// ---------- Vitrina pública ----------
function pintarVitrina() {
  $("vitrina").innerHTML = CURSOS.map(c => `
    <article class="curso bloqueado">
      <h3>${escapar(c.titulo)}</h3>
      <p>${escapar(c.desc)}</p>
      <span class="meta">${c.horas} horas</span>
    </article>`).join("");
}

// ---------- Sesión ----------
function sesionActual() {
  try { return JSON.parse(sessionStorage.getItem("ahd_sesion")); }
  catch { return null; }
}

function mostrarZona(afiliado) {
  $("zona-afiliado").hidden = false;
  $("btnIngresar").hidden = true;
  $("btnSalir").hidden = false;
  $("saludo").textContent = `Hola, ${afiliado.nombre}`;
  $("perfil").textContent = `${afiliado.perfil} · Afiliado desde ${afiliado.desde}`;

  const mios = CURSOS.filter(c => c.para.includes("todos") || c.para.includes(afiliado.perfil));
  $("listaCursos").innerHTML = mios.map(c => `
    <article class="curso">
      <h3>${escapar(c.titulo)}</h3>
      <p>${escapar(c.desc)}</p>
      <span class="meta">${c.horas} horas</span>
      <a class="btn btn-verde" href="${escapar(c.enlace)}">Entrar al curso</a>
    </article>`).join("");

  $("listaEventos").innerHTML = EVENTOS.map(e =>
    `<li><strong>${escapar(e.titulo)}</strong>${escapar(e.fecha)} · ${escapar(e.lugar)}</li>`).join("");

  $("listaNoticias").innerHTML = NOTICIAS.map(n =>
    `<li><strong>${escapar(n.titulo)}</strong>${escapar(n.texto)}</li>`).join("");

  $("carnet").innerHTML = `
    <p>Asociación Hispanoamericana del Deporte</p>
    <h3>${escapar(afiliado.nombre)}</h3>
    <p>${escapar(afiliado.perfil)}</p>
    <p>Afiliado desde ${afiliado.desde}</p>`;

  $("zona-afiliado").scrollIntoView();
}

function cerrarSesion() {
  sessionStorage.removeItem("ahd_sesion");
  $("zona-afiliado").hidden = true;
  $("btnIngresar").hidden = false;
  $("btnSalir").hidden = true;
  window.scrollTo(0, 0);
}

// ---------- Ingreso ----------
async function ingresar(evento) {
  evento.preventDefault();
  const cedula = $("cedula").value.replace(/\D/g, "");
  const error = $("errorLogin");
  error.hidden = true;

  if (cedula.length < 6) {
    error.textContent = "Escribe tu número de cédula completo, solo con números.";
    error.hidden = false;
    return;
  }

  const hash = await sha256(cedula);
  const afiliado = AFILIADOS.find(a => a.hash === hash);

  if (!afiliado) {
    error.textContent = "No encontramos esa cédula entre los afiliados. Revísala o escríbenos para afiliarte.";
    error.hidden = false;
    return;
  }

  sessionStorage.setItem("ahd_sesion", JSON.stringify(afiliado));
  $("dlgLogin").close();
  $("formLogin").reset();
  mostrarZona(afiliado);
}

// ---------- Pestañas ----------
function activarPestanas() {
  document.querySelectorAll(".pestana").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pestana").forEach(b => b.classList.remove("activa"));
      document.querySelectorAll(".panel").forEach(p => p.hidden = true);
      btn.classList.add("activa");
      $(btn.dataset.panel).hidden = false;
    });
  });
}

// ---------- Inicio ----------
document.addEventListener("DOMContentLoaded", () => {
  $("anio").textContent = new Date().getFullYear();
  pintarVitrina();
  activarPestanas();

  const abrir = () => { $("errorLogin").hidden = true; $("dlgLogin").showModal(); $("cedula").focus(); };
  $("btnIngresar").addEventListener("click", abrir);
  document.querySelectorAll("[data-abrir-login]").forEach(b => b.addEventListener("click", abrir));
  $("btnCancelar").addEventListener("click", () => $("dlgLogin").close());
  $("formLogin").addEventListener("submit", ingresar);
  $("btnSalir").addEventListener("click", cerrarSesion);

  const guardada = sesionActual();
  if (guardada) mostrarZona(guardada);
});

/* ============================================================
   CÓMO AGREGAR UN AFILIADO
   1. Abre la consola del navegador (F12 > Consola) y pega:
        crypto.subtle.digest("SHA-256", new TextEncoder().encode("NUMERO_DE_CEDULA"))
          .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,"0")).join("")))
   2. Copia el resultado y agrégalo a la lista AFILIADOS.
   ============================================================ */
