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

        cargarNegocio(business);

    } catch (error) {

        console.error(error);
        mostrarError("Ha ocurrido un error inesperado.");

    }
});


function cargarNegocio(business) {

    document.title = business.name;

    const nombre = document.querySelector("[data-business-name]");
    const descripcion = document.querySelector("[data-business-description]");
    const direccion = document.querySelector("[data-business-address]");

    if (nombre) {
        nombre.textContent = business.name;
    }

    if (descripcion) {
        descripcion.textContent = business.description || "";
    }

    if (direccion) {
        direccion.textContent = business.address || "";
    }

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

    cargarPromocion(business.id);
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

    boton.textContent = texto;

    contenedor.appendChild(boton);
}


async function cargarPromocion(businessId) {

    const { data, error } = await supabaseClient
        .from("promotions")
        .select("*")
        .eq("business_id", businessId)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error cargando promoción:", error);
        return;
    }

    if (!data) return;

    const promo = document.querySelector("[data-promotion]");

    if (!promo) return;

    promo.style.display = "block";

    const titulo = promo.querySelector("[data-promotion-title]");
    const descripcion = promo.querySelector("[data-promotion-description]");

    if (titulo) {
        titulo.textContent = data.title;
    }

    if (descripcion) {
        descripcion.textContent = data.description || "";
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
                <h1>Soluciones Digitales</h1>
                <p>${mensaje}</p>
            </div>
        </main>
    `;
}
