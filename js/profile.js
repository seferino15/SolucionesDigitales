document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const cliente = params.get("cliente");

    if (!cliente) {
        mostrarError("No se ha especificado ningún negocio.");
        return;
    }

    try {

        const { data: business, error } = await supabaseClient
            .from("businesses")
            .select("*")
            .eq("slug", cliente)
            .eq("active", true)
            .single();

        if (error) {
            console.error("Error cargando negocio:", error);
            mostrarError("No se ha podido cargar el negocio.");
            return;
        }

        if (!business) {
            mostrarError("Negocio no encontrado.");
            return;
        }

      console.log("NEGOCIO CARGADO:", business);

cargarNegocio(business);

await registrarVisita(business.id);

await cargarHorario(business.id);
await cargarPromocion(business.id);

    } catch (error) {

        console.error("Error inesperado:", error);

        mostrarError(
            "Ha ocurrido un error inesperado."
        );

    }

});


function cargarNegocio(business) {

    document.title =
        business.name || "Soluciones Digitales";

// =========================
// LOGO
// =========================

const logo =
    document.querySelector(
        "[data-business-logo]"
    );

if (logo && business.logo_url) {

    logo.innerHTML = "";

    const imagen =
        document.createElement("img");

    imagen.src =
        business.logo_url;

    imagen.alt =
        business.name || "Logo";

    imagen.loading =
        "eager";

    logo.appendChild(imagen);

}
    // =========================
    // NOMBRE
    // =========================

    const nombre =
        document.querySelector(
            "[data-business-name]"
        );

    if (nombre) {
        nombre.textContent =
            business.name || "";
    }


    // =========================
    // DESCRIPCIÓN
    // =========================

    const descripcion =
        document.querySelector(
            "[data-business-description]"
        );

    if (descripcion) {
        descripcion.textContent =
            business.description || "";
    }


    // =========================
    // DIRECCIÓN
    // =========================

    const direccion =
        document.querySelector(
            "[data-business-address]"
        );

    if (direccion) {

        const partes = [
            business.address,
            business.city,
            business.province
        ].filter(Boolean);

        direccion.textContent =
            partes.join(" · ");

    }


    // =========================
    // COLORES
    // =========================

    if (business.primary_color) {

        document.documentElement.style.setProperty(
            "--primary-color",
            business.primary_color
        );

    }

    if (business.secondary_color) {

        document.documentElement.style.setProperty(
            "--secondary-color",
            business.secondary_color
        );

    }


    // =========================
    // ENLACES
    // =========================

    crearBoton(
        "⭐ Google",
        business.google_url,
        "google"
    );

    crearBoton(
        "📸 Instagram",
        business.instagram_url,
        "instagram"
    );

    crearBoton(
        "📘 Facebook",
        business.facebook_url,
        "facebook"
    );

    crearBoton(
        "🎵 TikTok",
        business.tiktok_url,
        "tiktok"
    );

    crearBoton(
        "💬 WhatsApp",
        business.whatsapp,
        "whatsapp"
    );

    crearBoton(
        "🌐 Web",
        business.website,
        "web"
    );

    // MENÚ

    crearBoton(
        "🍽️ Ver menú",
        business.menu_url,
        "menu"
    );

}


function crearBoton(texto, url, tipo) {
    if (!url) return;

    const contenedor = document.querySelector("[data-business-links]");
    if (!contenedor) return;

    const boton = document.createElement("a");

    boton.href = url;
    boton.target = "_blank";
    boton.rel = "noopener noreferrer";

    boton.className = "profile-button";
    boton.dataset.type = tipo;
    boton.textContent = texto;

    boton.addEventListener("click", () => {
        registrarClick(tipo, url);
    });

    contenedor.appendChild(boton);
}


async function cargarHorario(businessId) {

    const { data, error } =
        await supabaseClient

            .from("business_hours")

            .select("*")

            .eq(
                "business_id",
                businessId
            )

            .order(
                "day_of_week",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Error cargando horario:",
            error
        );

        return;

    }


    const contenedor =
        document.querySelector(
            "[data-business-hours]"
        );


    if (!contenedor) return;


    const dias = [

        {
            numero: 1,
            nombre: "Lunes   "
        },

        {
            numero: 2,
            nombre: "Martes   "
        },

        {
            numero: 3,
            nombre: "Miércoles   "
        },

        {
            numero: 4,
            nombre: "Jueves   "
        },

        {
            numero: 5,
            nombre: "Viernes   "
        },

        {
            numero: 6,
            nombre: "Sábado   "
        },

        {
            numero: 0,
            nombre: "Domingo   "
        }

    ];


    if (!data || data.length === 0) {

        contenedor.innerHTML = `
            <div class="hours-empty">
                Horario no disponible
            </div>
        `;

        return;

    }


    const hoy =
        new Date().getDay();


    contenedor.innerHTML = "";


    dias.forEach(dia => {

        const horario =
            data.find(
                item =>
                    Number(item.day_of_week) ===
                    dia.numero
            );


        const fila =
            document.createElement("div");


        fila.className =
            "hours-row";


        if (dia.numero === hoy) {

            fila.classList.add(
                "today"
            );

        }


        const nombre =
            document.createElement("span");


        nombre.className =
            "hours-day";


        nombre.textContent =
            dia.nombre;


        const hora =
            document.createElement("span");


        hora.className =
            "hours-time";


        if (!horario) {

            hora.textContent =
                "No disponible";

        }

        else if (horario.closed) {

            hora.textContent =
                "Cerrado";

            fila.classList.add(
                "closed"
            );

        }

        else {

            const apertura =
                formatearHora(
                    horario.open_time
                );

            const cierre =
                formatearHora(
                    horario.close_time
                );


            hora.textContent =
                `${apertura} – ${cierre}`;

        }


        fila.appendChild(nombre);

        fila.appendChild(hora);

        contenedor.appendChild(fila);

    });

}


function formatearHora(hora) {

    if (!hora) return "";

    return hora.substring(0, 5);

}


async function cargarPromocion(businessId) {

    const { data, error } =
        await supabaseClient

            .from("promotions")

            .select("*")

            .eq(
                "business_id",
                businessId
            )

            .eq(
                "active",
                true
            )

            .limit(1)

            .maybeSingle();


    if (error) {

        console.error(
            "Error cargando promoción:",
            error
        );

        return;

    }


    if (!data) return;


    const promo =
        document.querySelector(
            "[data-promotion]"
        );


    if (!promo) return;


    promo.style.display =
        "block";


    const titulo =
        promo.querySelector(
            "[data-promotion-title]"
        );


    const descripcion =
        promo.querySelector(
            "[data-promotion-description]"
        );


    if (titulo) {

        titulo.textContent =
            data.title || "";

    }


    if (descripcion) {

        descripcion.textContent =
            data.description || "";

    }

}


function mostrarError(mensaje) {

    document.body.innerHTML = `

        <main style="
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:30px;
            font-family:Arial,sans-serif;
            text-align:center;
        ">

            <div>

                <h1>
                    Soluciones Digitales
                </h1>

                <p>
                    ${mensaje}
                </p>

            </div>

        </main>

    `;

}
async function registrarVisita(businessId) {
    try {
        const { error } = await supabaseClient
            .from("analytics")
            .insert({
                business_id: businessId,
                event_type: "page_view",
                target_url: window.location.href,
                user_agent: navigator.userAgent,
                referrer: document.referrer || null
            });

        if (error) {
            console.error("Error registrando visita:", error);
            return;
        }

        console.log("VISITA REGISTRADA");
    } catch (error) {
        console.error("Error inesperado registrando visita:", error);
    }
}
async function registrarClick(tipo, url) {
    try {
        const params = new URLSearchParams(window.location.search);
        const cliente = params.get("cliente");

        if (!cliente) return;

        const { data: business, error: businessError } = await supabaseClient
            .from("businesses")
            .select("id")
            .eq("slug", cliente)
            .eq("active", true)
            .single();

        if (businessError || !business) {
            console.error("No se pudo identificar el negocio:", businessError);
            return;
        }

        const { error } = await supabaseClient
            .from("analytics")
            .insert({
                business_id: business.id,
                event_type: "click",
                target_url: url,
                user_agent: navigator.userAgent,
                referrer: document.referrer || null
            });

        if (error) {
            console.error("Error registrando clic:", error);
            return;
        }

        console.log("CLICK REGISTRADO:", tipo);
    } catch (error) {
        console.error("Error inesperado registrando clic:", error);
    }
}
