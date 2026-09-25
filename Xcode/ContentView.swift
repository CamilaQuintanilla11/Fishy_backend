//
//  ContentView.swift
//  fishy_xcode
//
//  Created by Enrique Cruz on 23/09/26.
//

import SwiftUI

// MARK: - Colores del Diseño Figma
extension Color {
    static let figmaDarkBlue = Color(red: 0.05, green: 0.28, blue: 0.46) // #0C4775
    static let figmaTopBlob = Color(red: 0.85, green: 0.90, blue: 0.95)   // Azul claro
    static let figmaFieldBg = Color(red: 0.95, green: 0.95, blue: 0.95)   // Gris claro
    static let figmaCardBg = Color(red: 0.97, green: 0.97, blue: 0.97)    // Fondo tarjeta
    static let figmaLightRed = Color(red: 1.0, green: 0.90, blue: 0.90)   // Rojo claro
}

// MARK: - Modelo de Datos para Reportes
struct Reporte: Identifiable {
    let id = UUID()
    let inicial: String
    let colorInicial: Color
    let autor: String
    let titulo: String
    let descripcion: String
    let categoria: String
    let mePasoIgualCount: Int
    let comentariosCount: Int
}

// MARK: - Estados de Navegación del Sistema
enum AppScreen {
    case feed
    case newReport
    case readings
    case settings
    case profile
    case editReport
}

// MARK: - Vista Principal con Control de Estado
struct ContentView: View {
    @State private var isLoggedIn: Bool = false
    @State private var activeScreen: AppScreen = .feed
    @State private var currentAuthScreen: AuthScreen = .login
    @State private var showResetAlert: Bool = false

    enum AuthScreen {
        case login
        case register
        case recover
    }

    var body: some View {
        if isLoggedIn {
            switch activeScreen {
            case .feed:
                MainFeedView(isLoggedIn: $isLoggedIn, activeScreen: $activeScreen)
            case .newReport:
                NewReportView(activeScreen: $activeScreen)
            case .readings:
                ReadingsView(activeScreen: $activeScreen)
            case .settings:
                SettingsView(activeScreen: $activeScreen)
            case .profile:
                ProfileView(isLoggedIn: $isLoggedIn, activeScreen: $activeScreen)
            case .editReport:
                EditReportView(activeScreen: $activeScreen)
            }
        } else {
            ZStack {
                Color.white.ignoresSafeArea()

                // Curva azul superior
                VStack {
                    HStack {
                        Ellipse()
                            .fill(Color.figmaTopBlob)
                            .frame(width: 320, height: 300)
                            .offset(x: -90, y: -90)
                        Spacer()
                    }
                    Spacer()
                }
                .ignoresSafeArea()

                // Contenido de la pantalla de autenticación
                VStack(spacing: 0) {
                    Spacer()

                    switch currentAuthScreen {
                    case .login:
                        InicioSesionView(currentAuthScreen: $currentAuthScreen, isLoggedIn: $isLoggedIn)
                    case .register:
                        CreacionCuentaView(currentAuthScreen: $currentAuthScreen, isLoggedIn: $isLoggedIn)
                    case .recover:
                        RecuperacionCuentaView(currentAuthScreen: $currentAuthScreen, showAlert: $showResetAlert)
                    }

                    Spacer()

                    BottomBannerView()
                }
                .ignoresSafeArea(.all, edges: .bottom)

                // Modal Alerta de Recuperación
                if showResetAlert {
                    Color.black.opacity(0.35).ignoresSafeArea()

                    VStack(spacing: 16) {
                        Text("Revisa tu correo\nelectrónico")
                            .font(.system(size: 18, weight: .bold))
                            .multilineTextAlignment(.center)
                            .foregroundColor(.black)

                        Text("Si una cuenta coincide con la información que ingresaste, recibirás un correo electrónico con instrucciones.")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 10)

                        Button(action: {
                            showResetAlert = false
                            currentAuthScreen = .login
                        }) {
                            Text("Aceptar")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 38)
                                .background(Capsule().fill(Color.figmaDarkBlue))
                        }
                        .padding(.top, 5)
                    }
                    .padding(24)
                    .background(Color(red: 0.94, green: 0.94, blue: 0.94))
                    .cornerRadius(16)
                    .padding(.horizontal, 40)
                    .shadow(radius: 10)
                }
            }
        }
    }
}

// MARK: - 1. PANTALLA PRINCIPAL (HOME FEED)
struct MainFeedView: View {
    @Binding var isLoggedIn: Bool
    @Binding var activeScreen: AppScreen

    @State private var searchText = ""
    @State private var selectedFilter = "Recientes"

    let filtros = ["Recientes", "SMS", "URL", "Email", "Otros"]

    let listaReportes: [Reporte] = [
        Reporte(inicial: "A", colorInicial: .cyan, autor: "Anónimo", titulo: "Falso SMS de paquetería", descripcion: "Me llegó un SMS diciendo que mi paquete estaba retenido en aduana y pedían $50 MXN. El enlace lleva a una página idéntica a Correos de México, pero la URL es extraña. ¡No caigan!", categoria: "SMS", mePasoIgualCount: 24, comentariosCount: 2),
        Reporte(inicial: "N", colorInicial: .blue, autor: "Nophishing", titulo: "Email del \"Banco\"", descripcion: "Recibí un correo familiar que aparentemente era de mi banco, para notificarme que tenía un cargo retenido en mi tarjeta. Sabían mi nombre completo. Lo ignoré porque me pidieron el CVV.", categoria: "Email", mePasoIgualCount: 24, comentariosCount: 5),
        Reporte(inicial: "C", colorInicial: .cyan, autor: "Cass.Garcia", titulo: "Falsa oferta de trabajo en WhatsApp", descripcion: "Un número desconocido de otro país me contactó por WhatsApp ofreciéndome ganar dinero extra solo por darle \"Like\" a videos de YouTube.", categoria: "SMS", mePasoIgualCount: 24, comentariosCount: 15),
        Reporte(inicial: "MG", colorInicial: .blue, autor: "Mariana_Gtz", titulo: "Promoción falsa de streaming", descripcion: "Vi una publicación en Twitter con un enlace que prometía un año de suscripción gratis a una plataforma de películas.", categoria: "URL", mePasoIgualCount: 24, comentariosCount: 15),
        Reporte(inicial: "D", colorInicial: .cyan, autor: "David_Dev", titulo: "Falso recibo de compra en tienda en línea", descripcion: "Me llegó un correo supuestamente de \"Soporte de Tienda\" indicando que se había autorizado exitosamente una compra por $12,500 MXN.", categoria: "Email", mePasoIgualCount: 24, comentariosCount: 21)
    ]

    var reportesFiltrados: [Reporte] {
        var resultado = listaReportes
        if selectedFilter != "Recientes" {
            resultado = resultado.filter { $0.categoria == selectedFilter }
        }
        if !searchText.isEmpty {
            resultado = resultado.filter {
                $0.titulo.localizedCaseInsensitiveContains(searchText) ||
                $0.descripcion.localizedCaseInsensitiveContains(searchText)
            }
        }
        return resultado
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header Superior Azul
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "fish.fill")
                        .font(.system(size: 20))
                    Text("Fishy")
                        .font(.system(size: 22, weight: .bold))
                }
                .foregroundColor(.white)

                Spacer()

                Button(action: {
                    activeScreen = .profile
                }) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 26))
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.figmaDarkBlue)

            // Buscador y Filtros
            VStack(spacing: 12) {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    TextField("Buscar reportes o fraudes...", text: $searchText)
                        .font(.system(size: 13))
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))
                .padding(.horizontal, 16)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(filtros, id: \.self) { filtro in
                            Button(action: { selectedFilter = filtro }) {
                                Text(filtro)
                                    .font(.system(size: 12, weight: selectedFilter == filtro ? .bold : .regular))
                                    .foregroundColor(selectedFilter == filtro ? .white : .black)
                                    .padding(.horizontal, 18)
                                    .padding(.vertical, 6)
                                    .background(
                                        Capsule()
                                            .fill(selectedFilter == filtro ? Color.figmaDarkBlue : Color.figmaFieldBg)
                                    )
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
            .padding(.top, 10)
            .padding(.bottom, 10)
            .background(Color.white)

            // Feed
            ScrollView {
                LazyVStack(spacing: 14) {
                    ForEach(reportesFiltrados) { reporte in
                        ReportCardView(reporte: reporte)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            }
            .background(Color(red: 0.92, green: 0.94, blue: 0.96))

            CustomBottomBar(activeScreen: $activeScreen)
        }
        .ignoresSafeArea(.all, edges: .bottom)
    }
}

// MARK: - 2. PANTALLA LECTURAS Y TUTORIALES (📖)
struct ReadingsView: View {
    @Binding var activeScreen: AppScreen

    var body: some View {
        VStack(spacing: 0) {
            // Header Superior Azul
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "fish.fill")
                        .font(.system(size: 20))
                    Text("Fishy")
                        .font(.system(size: 22, weight: .bold))
                }
                .foregroundColor(.white)

                Spacer()

                Button(action: {
                    activeScreen = .profile
                }) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 26))
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.figmaDarkBlue)

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    // Título principal
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Lecturas")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.black)
                        Text("Aprende a detectar amenazas")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                    }
                    .padding(.top, 14)

                    // Tarjeta Cinturón Blanco en Seguridad
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Cinturón Blanco en Seguridad")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)

                        Text("Progreso 2 / 6")
                            .font(.system(size: 10, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))

                        // Barra de progreso con 6 segmentos
                        HStack(spacing: 6) {
                            ForEach(0..<6, id: \.self) { index in
                                RoundedRectangle(cornerRadius: 3)
                                    .fill(index < 2 ? Color.white : Color.white.opacity(0.35))
                                    .frame(height: 8)
                            }
                        }
                    }
                    .padding(16)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(LinearGradient(gradient: Gradient(colors: [Color(red: 0.45, green: 0.65, blue: 0.80), Color(red: 0.35, green: 0.55, blue: 0.72)]), startPoint: .topLeading, endPoint: .bottomTrailing))
                    )

                    // Módulos Faltantes
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Módulos faltantes")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.black)

                        // Módulo 1: Engaño Telefónico
                        ModuleCardRow(
                            iconName: "phone.down.fill",
                            iconColor: Color.red.opacity(0.7),
                            iconBg: Color.red.opacity(0.12),
                            title: "El engaño telefónico",
                            subtitle: "Identifica a los falsos agentes de banco"
                        )

                        // Módulo 2: Mercado Seguro
                        ModuleCardRow(
                            iconName: "storefront.fill",
                            iconColor: Color.green,
                            iconBg: Color.green.opacity(0.15),
                            title: "Mercado Seguro: Mundial 2026",
                            subtitle: "Fraudes comunes en la reventa de boletos"
                        )

                        // Módulo 3: Compras Seguras
                        ModuleCardRow(
                            iconName: "bag.fill",
                            iconColor: Color.blue,
                            iconBg: Color.blue.opacity(0.15),
                            title: "Compras seguras en línea",
                            subtitle: "Aprende a detectar si una tienda es de confianza"
                        )

                        // Módulo 4: Criptomonedas
                        ModuleCardRow(
                            iconName: "bitcoinsign.circle.fill",
                            iconColor: Color(red: 0.7, green: 0.7, blue: 0.1),
                            iconBg: Color.yellow.opacity(0.2),
                            title: "Mercado Electrónico: Criptomonedas",
                            subtitle: "Riesgos en el intercambio de activos digitales"
                        )
                    }

                    // Radar de Fraudes
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Radar de fraudes")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.black)

                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Fraudes más reportados")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(.black)
                                    Text("Últimos 30 días")
                                        .font(.system(size: 10))
                                        .foregroundColor(.gray)
                                }
                                Spacer()
                            }

                            // Gráfico de Barras
                            HStack(alignment: .bottom, spacing: 24) {
                                BarChartItem(label: "Phish", height: 65, color: Color.blue)
                                BarChartItem(label: "Clon", height: 45, color: Color.green.opacity(0.4))
                                BarChartItem(label: "Banco", height: 55, color: Color.cyan)
                                BarChartItem(label: "Multas", height: 95, color: Color(red: 0.1, green: 0.9, blue: 0.7))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, 10)
                            .padding(.bottom, 6)
                        }
                        .padding(16)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.figmaFieldBg))
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }

            CustomBottomBar(activeScreen: $activeScreen)
        }
        .background(Color.white)
        .ignoresSafeArea(.all, edges: .bottom)
    }
}

// Auxiliar para cada Módulo Faltante
struct ModuleCardRow: View {
    let iconName: String
    let iconColor: Color
    let iconBg: Color
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(iconBg)
                    .frame(width: 36, height: 36)
                Image(systemName: iconName)
                    .font(.system(size: 16))
                    .foregroundColor(iconColor)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.black)
                Text(subtitle)
                    .font(.system(size: 9))
                    .foregroundColor(.gray)
            }

            Spacer()
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.figmaFieldBg))
    }
}

// Auxiliar para cada barra del gráfico
struct BarChartItem: View {
    let label: String
    let height: CGFloat
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 4)
                .fill(color)
                .frame(width: 28, height: height)

            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.gray)
        }
    }
}

// MARK: - 3. PANTALLA NUEVO REPORTE (+)
struct NewReportView: View {
    @Binding var activeScreen: AppScreen

    @State private var tipoFraude = "Mensaje / SMS"
    @State private var numeroOEnlace = ""
    @State private var descripcion = ""
    @State private var esAnonimo = false

    let tipos = ["Mensaje / SMS", "Email", "Link / URL", "Otro"]

    var body: some View {
        VStack(spacing: 0) {
            // Header Superior Azul (Logo Fishy + Perfil)
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "fish.fill")
                        .font(.system(size: 20))
                    Text("Fishy")
                        .font(.system(size: 22, weight: .bold))
                }
                .foregroundColor(.white)

                Spacer()

                Button(action: {
                    activeScreen = .profile
                }) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 26))
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.figmaDarkBlue)

            // Subheader con Título y Botón Enviar
            HStack {
                Text("Nuevo Reporte")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.black)

                Spacer()

                Button(action: {
                    activeScreen = .feed
                }) {
                    Text("enviar")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 6)
                        .background(Capsule().fill(Color.figmaDarkBlue))
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 14)
            .padding(.bottom, 10)

            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    // 1. Tipo de Fraude
                    VStack(alignment: .leading, spacing: 8) {
                        Text("¿Qué tipo de fraude es?")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.black)

                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                            ForEach(tipos, id: \.self) { tipo in
                                Button(action: { tipoFraude = tipo }) {
                                    Text(tipo)
                                        .font(.system(size: 11, weight: tipoFraude == tipo ? .bold : .regular))
                                        .foregroundColor(tipoFraude == tipo ? .black : .gray)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 32)
                                        .background(
                                            RoundedRectangle(cornerRadius: 6)
                                                .fill(tipoFraude == tipo ? Color.figmaFieldBg : Color.white)
                                                .overlay(
                                                    RoundedRectangle(cornerRadius: 6)
                                                        .stroke(tipoFraude == tipo ? Color.gray.opacity(0.5) : Color.gray.opacity(0.2), lineWidth: 1)
                                                )
                                        )
                                }
                            }
                        }
                    }

                    // 2. Número o Enlace
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Número o enlace sospechoso")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.black)

                        TextField("Ej. 55 1234 5678 o www.comprasfalsas.com", text: $numeroOEnlace)
                            .font(.system(size: 11))
                            .padding(12)
                            .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))
                    }

                    // 3. Describe lo que pasó
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Describe lo que pasó")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.black)

                        ZStack(alignment: .topLeading) {
                            if descripcion.isEmpty {
                                Text("Da todos los detalles posibles para alertar a la comunidad...")
                                    .font(.system(size: 11))
                                    .foregroundColor(.gray.opacity(0.6))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 12)
                            }
                            TextEditor(text: $descripcion)
                                .font(.system(size: 11))
                                .padding(8)
                                .opacity(descripcion.isEmpty ? 0.8 : 1)
                        }
                        .frame(height: 100)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))
                    }

                    // 4. Evidencia
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Evidencia")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.black)

                        VStack(spacing: 6) {
                            Image(systemName: "icloud.and.arrow.up")
                                .font(.system(size: 22))
                                .foregroundColor(Color.figmaDarkBlue)
                            Text("Sube capturas de pantalla o audios")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(.gray)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 80)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.3), style: StrokeStyle(dash: [4]))
                        )
                    }

                    // 5. Publicar como anónimo
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Publicar como anónimo")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.black)
                            Text("Oculta tu nombre de usuario en este reporte")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Toggle("", isOn: $esAnonimo)
                            .labelsHidden()
                    }
                    .padding(12)
                    .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }

            CustomBottomBar(activeScreen: $activeScreen)
        }
        .background(Color.white)
        .ignoresSafeArea(.all, edges: .bottom)
    }
}

// MARK: - 4. PANTALLA DE CONFIGURACIÓN (⚙)
struct SettingsView: View {
    @Binding var activeScreen: AppScreen

    @State private var notificaciones = false
    @State private var modoOscuro = false

    var body: some View {
        VStack(spacing: 0) {
            // Header Superior Azul
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "fish.fill")
                        .font(.system(size: 20))
                    Text("Fishy")
                        .font(.system(size: 22, weight: .bold))
                }
                .foregroundColor(.white)

                Spacer()

                Button(action: {
                    activeScreen = .profile
                }) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 26))
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Color.figmaDarkBlue)

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("Configuración")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.black)
                        .padding(.top, 16)

                    // Sección Cuenta
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Cuenta")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.gray)

                        HStack {
                            Image(systemName: "figure.walk")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                                .frame(width: 24)
                            Text("Accesibilidad")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                        }
                        .padding(12)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

                        HStack {
                            Image(systemName: "bell.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                                .frame(width: 24)
                            Text("Notificaciones")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                            Spacer()
                            Toggle("", isOn: $notificaciones)
                                .labelsHidden()
                        }
                        .padding(12)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))
                    }

                    // Sección Aplicación
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Aplicación")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.gray)

                        HStack {
                            Image(systemName: "moon.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                                .frame(width: 24)
                            Text("Modo Oscuro")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                            Spacer()
                            Toggle("", isOn: $modoOscuro)
                                .labelsHidden()
                        }
                        .padding(12)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

                        HStack {
                            Image(systemName: "info.circle")
                                .font(.system(size: 14))
                                .foregroundColor(.gray)
                                .frame(width: 24)
                            Text("Información de privacidad")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                        }
                        .padding(12)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))
                    }
                }
                .padding(.horizontal, 24)
            }

            CustomBottomBar(activeScreen: $activeScreen)
        }
        .background(Color.white)
        .ignoresSafeArea(.all, edges: .bottom)
    }
}

// MARK: - 5. PANTALLA DE PERFIL (MI PERFIL)
struct ProfileView: View {
    @Binding var isLoggedIn: Bool
    @Binding var activeScreen: AppScreen

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button(action: { activeScreen = .feed }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)
                }

                Spacer()

                Text("Mi perfil")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)

                Spacer()

                Image(systemName: "chevron.left").opacity(0)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .background(Color.figmaDarkBlue)

            ScrollView {
                VStack(spacing: 20) {
                    VStack(spacing: 8) {
                        ZStack {
                            Circle()
                                .fill(Color(red: 0.70, green: 0.82, blue: 0.93))
                                .frame(width: 70, height: 70)
                            Text("U")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(Color.figmaDarkBlue)
                        }

                        Text("User1908e9  •  Miembro desde Ago 2026")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.gray)
                    }
                    .padding(.top, 15)

                    HStack(spacing: 16) {
                        VStack(spacing: 4) {
                            Text("1")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(Color.figmaDarkBlue)
                            Text("Reportes")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.figmaFieldBg))

                        VStack(spacing: 4) {
                            Text("12")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundColor(Color(red: 0.4, green: 0.7, blue: 0.6))
                            Text("Aportes")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.figmaFieldBg))
                    }
                    .padding(.horizontal, 24)

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Mis reportes")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.black)

                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Falso recibo de compra en tienda en línea")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.black)

                                Spacer()

                                Button(action: { activeScreen = .editReport }) {
                                    Image(systemName: "pencil")
                                        .font(.system(size: 12))
                                        .foregroundColor(.gray)
                                        .padding(6)
                                        .background(Circle().fill(Color.gray.opacity(0.15)))
                                }
                            }

                            Text("Me llegó un correo supuestamente de \"Soporte de Tienda\" indicando que se había autorizado exitosamente una compra por $12,500 MXN para una laptop.")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                                .lineLimit(3)
                        }
                        .padding(14)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.white))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2), lineWidth: 1))
                    }
                    .padding(.horizontal, 24)

                    Spacer(minLength: 20)

                    Button(action: {
                        isLoggedIn = false
                        activeScreen = .feed
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                            Text("Cerrar sesión")
                        }
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(Color.red.opacity(0.8))
                        .padding(.horizontal, 24)
                        .padding(.vertical, 8)
                        .background(
                            Capsule()
                                .stroke(Color.red.opacity(0.3), lineWidth: 1)
                                .background(Capsule().fill(Color.figmaLightRed.opacity(0.3)))
                        )
                    }
                    .padding(.bottom, 20)
                }
            }

            BottomBannerView()
        }
        .background(Color.white)
        .ignoresSafeArea(.all, edges: .bottom)
    }
}

// MARK: - 6. PANTALLA DE EDITAR REPORTE
struct EditReportView: View {
    @Binding var activeScreen: AppScreen

    @State private var titulo = "Falso recibo de compra en tienda en línea"
    @State private var descripcion = "Me llegó un SMS desde el número 55-7643-5578 diciendo que mi paquete estaba retenido en aduana..."
    @State private var categoria = "Email"

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Button(action: { activeScreen = .profile }) {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Regresar")
                    }
                    .font(.system(size: 13))
                    .foregroundColor(.gray)
                }
                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.white)

            ScrollView {
                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack(spacing: 8) {
                            ZStack {
                                Circle()
                                    .fill(Color(red: 0.70, green: 0.82, blue: 0.93))
                                    .frame(width: 32, height: 32)
                                Text("U")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(Color.figmaDarkBlue)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text("User1908e9")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.black)
                                Text("28 de Agosto, 11:25 AM")
                                    .font(.system(size: 9))
                                    .foregroundColor(.gray)
                            }

                            Text("En revisión")
                                .font(.system(size: 8, weight: .bold))
                                .foregroundColor(.orange)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Capsule().fill(Color.orange.opacity(0.15)))

                            Spacer()
                        }

                        Divider()

                        HStack {
                            Spacer()
                            Text("Editar texto")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.gray)
                        }

                        TextField("Título del reporte", text: $titulo)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(.black)

                        TextEditor(text: $descripcion)
                            .font(.system(size: 11))
                            .foregroundColor(Color(white: 0.3))
                            .frame(height: 110)
                            .padding(4)
                            .background(RoundedRectangle(cornerRadius: 6).fill(Color.white))

                        HStack {
                            Spacer()
                            Text("Editar imagen")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.gray)
                        }

                        HStack(spacing: 8) {
                            Image(systemName: "photo")
                                .foregroundColor(.gray)
                            Text("Captura_pantalla.png")
                                .font(.system(size: 10))
                                .foregroundColor(.gray)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 70)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.white))
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.gray.opacity(0.3), style: StrokeStyle(dash: [4])))

                        HStack {
                            Spacer()
                            Text("Editar categoria")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.gray)
                        }

                        Text(categoria)
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.gray)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(RoundedRectangle(cornerRadius: 4).fill(Color.white))

                        Button(action: { activeScreen = .profile }) {
                            Text("Guardar cambios")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 40)
                                .background(Capsule().fill(Color.figmaDarkBlue))
                        }
                        .padding(.top, 8)

                        Button(action: { activeScreen = .profile }) {
                            Text("Eliminar reporte")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(Color.red.opacity(0.8))
                                .frame(maxWidth: .infinity)
                                .frame(height: 40)
                                .background(Capsule().fill(Color.figmaLightRed))
                        }
                    }
                    .padding(16)
                    .background(RoundedRectangle(cornerRadius: 16).fill(Color.figmaFieldBg))
                    .padding(.horizontal, 16)
                }
                .padding(.vertical, 10)
            }
            .background(Color.white)
        }
    }
}

// MARK: - COMPONENTES REUTILIZABLES
struct ReportCardView: View {
    let reporte: Reporte

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                ZStack {
                    Circle()
                        .fill(reporte.colorInicial)
                        .frame(width: 32, height: 32)
                    Text(reporte.inicial)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.black)
                }

                Text(reporte.autor)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.black)

                Text("Usuario verificado")
                    .font(.system(size: 8, weight: .medium))
                    .foregroundColor(.green)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(Color.green.opacity(0.15)))

                Spacer()
            }

            Text(reporte.titulo)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.black)

            Text(reporte.descripcion)
                .font(.system(size: 11))
                .foregroundColor(Color(white: 0.3))

            Text(reporte.categoria)
                .font(.system(size: 8, weight: .bold))
                .foregroundColor(.gray)
                .padding(.horizontal, 8)
                .padding(.vertical, 3)
                .background(RoundedRectangle(cornerRadius: 4).fill(Color.gray.opacity(0.2)))

            Divider()

            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "hand.thumbsup")
                    Text("\(reporte.mePasoIgualCount) Me pasó igual")
                }
                .font(.system(size: 11))

                Spacer()

                HStack(spacing: 4) {
                    Image(systemName: "bubble.right")
                    Text("\(reporte.comentariosCount) comentarios")
                }
                .font(.system(size: 11))

                Spacer()

                Image(systemName: "square.and.arrow.up")
                    .font(.system(size: 11))
            }
            .foregroundColor(.black)
        }
        .padding(14)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.04), radius: 3, x: 0, y: 2)
    }
}

// MARK: - BARRA INFERIOR CON NAVEGACIÓN DINÁMICA
struct CustomBottomBar: View {
    @Binding var activeScreen: AppScreen

    var body: some View {
        HStack {
            Spacer()

            // Tab 1: Home (Inicio)
            Button(action: { activeScreen = .feed }) {
                ZStack {
                    Circle()
                        .fill(activeScreen == .feed ? Color.white : Color.clear)
                        .frame(width: 42, height: 42)
                    Image(systemName: "house.fill")
                        .font(.system(size: 18))
                        .foregroundColor(activeScreen == .feed ? Color.figmaDarkBlue : .white)
                }
            }

            Spacer()

            // Tab 2: Crear / Agregar (+)
            Button(action: { activeScreen = .newReport }) {
                ZStack {
                    Circle()
                        .fill(activeScreen == .newReport ? Color.white : Color.clear)
                        .frame(width: 42, height: 42)
                    Image(systemName: "plus")
                        .font(.system(size: activeScreen == .newReport ? 20 : 22, weight: .bold))
                        .foregroundColor(activeScreen == .newReport ? Color.figmaDarkBlue : .white)
                }
            }

            Spacer()

            // Tab 3: Lecturas / Libro (📖)
            Button(action: { activeScreen = .readings }) {
                ZStack {
                    Circle()
                        .fill(activeScreen == .readings ? Color.white : Color.clear)
                        .frame(width: 42, height: 42)
                    Image(systemName: "book.fill")
                        .font(.system(size: 18))
                        .foregroundColor(activeScreen == .readings ? Color.figmaDarkBlue : .white)
                }
            }

            Spacer()

            // Tab 4: Configuración (⚙)
            Button(action: { activeScreen = .settings }) {
                ZStack {
                    Circle()
                        .fill(activeScreen == .settings ? Color.white : Color.clear)
                        .frame(width: 42, height: 42)
                    Image(systemName: "gearshape.fill")
                        .font(.system(size: 20))
                        .foregroundColor(activeScreen == .settings ? Color.figmaDarkBlue : .white)
                }
            }

            Spacer()
        }
        .padding(.vertical, 10)
        .padding(.bottom, 12)
        .background(Color.figmaDarkBlue)
    }
}

// MARK: - VISTAS DE AUTENTICACIÓN
struct InicioSesionView: View {
    @Binding var currentAuthScreen: ContentView.AuthScreen
    @Binding var isLoggedIn: Bool
    @State private var correo = ""
    @State private var contrasena = ""

    var body: some View {
        VStack(spacing: 16) {
            Text("Inicio de sesión")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(Color(white: 0.2))
                .padding(.bottom, 10)

            TextField("Correo", text: $correo)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

            SecureField("Contraseña", text: $contrasena)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

            Button(action: { isLoggedIn = true }) {
                Text("Iniciar sesión")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Capsule().fill(Color.figmaDarkBlue))
            }
            .padding(.top, 8)

            Button(action: { currentAuthScreen = .recover }) {
                Text("¿Olvidaste tu contraseña?")
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
            }

            Button(action: { currentAuthScreen = .register }) {
                Text("Crear cuenta nueva")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color.figmaDarkBlue)
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Capsule().stroke(Color.figmaDarkBlue, lineWidth: 1.5))
            }
            .padding(.top, 10)
        }
        .padding(.horizontal, 36)
    }
}

struct CreacionCuentaView: View {
    @Binding var currentAuthScreen: ContentView.AuthScreen
    @Binding var isLoggedIn: Bool
    @State private var nombre = ""
    @State private var apellidos = ""
    @State private var usuario = ""
    @State private var correo = ""
    @State private var contrasena = ""

    var body: some View {
        VStack(spacing: 14) {
            Text("Creación de cuenta")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(Color(white: 0.2))
                .padding(.bottom, 10)

            HStack(spacing: 10) {
                TextField("Nombre (s)", text: $nombre)
                    .padding(12)
                    .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

                TextField("Apellidos", text: $apellidos)
                    .padding(12)
                    .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))
            }

            TextField("Nombre de usuario", text: $usuario)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

            TextField("Correo", text: $correo)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

            SecureField("Contraseña", text: $contrasena)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

            Button(action: { isLoggedIn = true }) {
                Text("Registrarse")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Capsule().fill(Color.figmaDarkBlue))
            }
            .padding(.top, 10)

            Button(action: { currentAuthScreen = .login }) {
                Text("Iniciar Sesión")
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
            }
        }
        .padding(.horizontal, 36)
    }
}

struct RecuperacionCuentaView: View {
    @Binding var currentAuthScreen: ContentView.AuthScreen
    @Binding var showAlert: Bool
    @State private var correoOUsuario = ""

    var body: some View {
        VStack(spacing: 14) {
            Text("Recuperación de cuenta")
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(Color(white: 0.2))
                .padding(.bottom, 10)

            TextField("Correo o usuario", text: $correoOUsuario)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.figmaFieldBg))

            Text("Podemos enviarte notificaciones por correo electrónico,\ncon fines de seguridad e inicio de sesión.")
                .font(.system(size: 10))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.vertical, 4)

            Button(action: { showAlert = true }) {
                Text("Continuar")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Capsule().fill(Color.figmaDarkBlue))
            }

            Button(action: { currentAuthScreen = .login }) {
                Text("Iniciar Sesión")
                    .font(.system(size: 11))
                    .foregroundColor(.gray)
            }
        }
        .padding(.horizontal, 36)
    }
}

struct BottomBannerView: View {
    var body: some View {
        VStack(spacing: 4) {
            HStack(spacing: 8) {
                Image(systemName: "fish.fill")
                    .font(.system(size: 20))
                Text("Fishy")
                    .font(.system(size: 22, weight: .bold))
            }
            .foregroundColor(.white)

            Text("© 2026 Fishy (o en Equipo)")
                .font(.system(size: 9))
                .foregroundColor(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
        .background(Color.figmaDarkBlue)
    }
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
