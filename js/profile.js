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


    // NOMBRE

    const nombre =
        document.querySelector(
            "[data-business-name]"
        );

    if (nombre) {

        nombre.textContent =
            business.name || "";

    }


    // DESCRIPCIÓN

    const descripcion =
        document.querySelector(
            "[data-business-description]"
        );

    if (descripcion) {

        descripcion.textContent =
            business.description || "";

    }


    // DIRECCIÓN

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


    // COLORES

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


    // ENLACES

    crearBoton(
        "Google",
        business.google_url,
        "google"
    );

    crearBoton(
        "Instagram",
        business.instagram_url,
        "instagram"
    );

    crearBoton(
        "WhatsApp",
        business.whatsapp,
        "whatsapp"
    );

    crearBoton(
        "Web",
        business.website,
        "web"
    );

}


function crearBoton(texto, url, tipo) {

    if (!url) return;

    const contenedor =
        document.querySelector(
            "[data-business-links]"
        );

    if (!contenedor) return;


    const boton =
        document.createElement("a");


    boton.href = url;

    boton.target = "_blank";

    boton.rel =
        "noopener noreferrer";

    boton.className =
        "profile-button";

    boton.dataset.type =
        tipo;

    boton.textContent =
        texto;


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


    const elemento =
        document.querySelector(
            "[data-business-hours]"
        );


    if (!elemento) return;


    if (!data || data.length === 0) {

        elemento.textContent = "Consultar";

        return;

    }


    const dias = {

        0: "Domingo",

        1: "Lunes",

        2: "Martes",

        3: "Miércoles",

        4: "Jueves",

        5: "Viernes",

        6: "Sábado"

    };


    const hoy =
        new Date().getDay();


    const horarioHoy =
        data.find(
            dia =>
                Number(dia.day_of_week) === hoy
        );


    if (horarioHoy) {

        if (horarioHoy.closed) {

            elemento.textContent =
                "Cerrado hoy";

        } else {

            const apertura =
                horarioHoy.open_time
                || "";

            const cierre =
                horarioHoy.close_time
                || "";

            elemento.textContent =
                `${apertura} – ${cierre}`;

        }

    } else {

        elemento.textContent =
            "Consultar horario";

    }

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
