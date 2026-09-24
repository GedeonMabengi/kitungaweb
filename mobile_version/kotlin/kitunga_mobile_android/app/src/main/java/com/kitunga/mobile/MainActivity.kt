package com.kitunga.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KitungaTheme {
                KitungaApp()
            }
        }
    }
}

@Composable
private fun KitungaApp() {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    var isLoggedIn by remember { mutableStateOf(false) }
    var selectedTab by remember { mutableStateOf("Accueil") }

    val mockUsers = listOf(
        MockUser("admin@kitunga.test", "Administrateur", "Admin Kitunga", "admin123", "admin"),
        MockUser("caissier@kitunga.test", "Caissier", "Caissier Kitunga", "caisse123", "caissier"),
        MockUser("vendeur@kitunga.test", "Vendeur", "Vendeur Kitunga", "vendeur123", "vendeur"),
        MockUser("stock@kitunga.test", "Gestionnaire stock", "Stock Kitunga", "stock123", "gestionnaire_stock")
    )

    val tabs = listOf("Accueil", "Ventes", "Stock", "Caisse", "Rapports", "Utilisateurs", "Profil")

    if (!isLoggedIn) {
        LoginScreen(
            email = email,
            password = password,
            showPassword = showPassword,
            error = error,
            onEmailChange = { email = it; error = "" },
            onPasswordChange = { password = it; error = "" },
            onTogglePassword = { showPassword = !showPassword },
            onLogin = {
                val user = mockUsers.firstOrNull { it.email == email.trim() && it.password == password }
                if (user == null) {
                    error = "Identifiants invalides. Utilise un compte de démonstration ci-dessous."
                    return@LoginScreen
                }
                isLoggedIn = true
                selectedTab = "Accueil"
            },
            onGuestMode = {
                isLoggedIn = true
                selectedTab = "Accueil"
            }
        )
        return
    }

    DashboardScreen(
        user = mockUsers.firstOrNull { it.email == email.trim() } ?: mockUsers.first(),
        tabs = tabs,
        selectedTab = selectedTab,
        onSelectTab = { selectedTab = it },
        onLogout = { isLoggedIn = false; email = ""; password = ""; error = "" }
    )
}

@Composable
private fun LoginScreen(
    email: String,
    password: String,
    showPassword: Boolean,
    error: String,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onTogglePassword: () -> Unit,
    onLogin: () -> Unit,
    onGuestMode: () -> Unit,
) {
    val accent = Color(0xFFF5B63F)
    val background = Color(0xFFF7F5EF)
    val card = Color.White
    val ink = Color(0xFF172033)
    val muted = Color(0xFF697386)
    val border = Color(0xFFE4E7EC)
    val danger = Color(0xFFC2413B)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(ink)
                    .width(64.dp)
                    .height(64.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("K", color = accent, fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
            }

            Spacer(modifier = Modifier.height(14.dp))
            Text("KITUNGA", color = ink, fontWeight = FontWeight.ExtraBold, letterSpacing = 3.sp)
            Text("Ton activité, simplement.", color = muted, fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp))

            Spacer(modifier = Modifier.height(28.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(28.dp),
                colors = CardDefaults.cardColors(containerColor = card),
                elevation = CardDefaults.cardElevation(defaultElevation = 5.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp)
                ) {
                    Surface(
                        color = Color(0xFFFFF4D8),
                        shape = RoundedCornerShape(99.dp)
                    ) {
                        Text(
                            text = "ESPACE PROFESSIONNEL",
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            color = Color(0xFF9A6411),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 0.8.sp
                        )
                    }

                    Text("Bienvenue", color = ink, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 18.dp))
                    Text("Connecte-toi pour retrouver ton espace de gestion.", color = muted, fontSize = 14.sp, modifier = Modifier.padding(top = 8.dp))

                    Spacer(modifier = Modifier.height(18.dp))
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFAF0)),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF4DFB0))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text("COMPTES DE DÉMONSTRATION", color = Color(0xFF9A6411), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.6.sp)
                            Text("admin@kitunga.test / admin123", color = Color(0xFF806B49), fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                            Text("caissier@kitunga.test / caisse123", color = Color(0xFF806B49), fontSize = 11.sp)
                            Text("vendeur@kitunga.test / vendeur123", color = Color(0xFF806B49), fontSize = 11.sp)
                            Text("stock@kitunga.test / stock123", color = Color(0xFF806B49), fontSize = 11.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    OutlinedTextField(
                        value = email,
                        onValueChange = onEmailChange,
                        label = { Text("Adresse email") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = accent,
                            unfocusedBorderColor = border,
                            focusedTextColor = ink,
                            unfocusedTextColor = ink,
                            focusedLabelColor = ink,
                            unfocusedLabelColor = ink,
                            cursorColor = accent
                        )
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    OutlinedTextField(
                        value = password,
                        onValueChange = onPasswordChange,
                        label = { Text("Mot de passe") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                        trailingIcon = {
                            val icon: ImageVector = if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility
                            IconButton(onClick = onTogglePassword) {
                                Icon(imageVector = icon, contentDescription = null, tint = muted)
                            }
                        },
                        colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = accent,
                            unfocusedBorderColor = border,
                            focusedTextColor = ink,
                            unfocusedTextColor = ink,
                            focusedLabelColor = ink,
                            unfocusedLabelColor = ink,
                            cursorColor = accent
                        )
                    )

                    if (error.isNotBlank()) {
                        Text(error, color = danger, fontSize = 13.sp, modifier = Modifier.padding(top = 8.dp))
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    Button(
                        onClick = onLogin,
                        modifier = Modifier.fillMaxWidth().height(54.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = accent, contentColor = ink),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Se connecter", fontWeight = FontWeight.ExtraBold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))
            TextButton(
                onClick = onGuestMode,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(15.dp)
            ) {
                Text("Continuer en mode démonstration admin", color = Color(0xFF9A6411), fontWeight = FontWeight.ExtraBold)
            }

            Text("Aucune donnée de démonstration ne sera synchronisée.", color = muted, fontSize = 10.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 7.dp))

            Spacer(modifier = Modifier.height(24.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(modifier = Modifier.width(8.dp).height(8.dp).clip(CircleShape).background(accent))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Une gestion commerciale pensée pour toi.", color = muted, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun DashboardScreen(
    user: MockUser,
    tabs: List<String>,
    selectedTab: String,
    onSelectTab: (String) -> Unit,
    onLogout: () -> Unit,
) {
    val accent = Color(0xFFF5B63F)
    val background = Color(0xFFF7F5EF)
    val card = Color.White
    val ink = Color(0xFF172033)
    val muted = Color(0xFF697386)
    val border = Color(0xFFE4E7EC)

    val activeTab = if (tabs.contains(selectedTab)) selectedTab else "Accueil"

    Box(modifier = Modifier.fillMaxSize().background(background)) {
        Column(modifier = Modifier.fillMaxSize()) {
            Spacer(modifier = Modifier.height(10.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp),
                colors = CardDefaults.cardColors(containerColor = card),
                shape = RoundedCornerShape(18.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, border)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .width(36.dp)
                            .height(36.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFFFF4D8)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(getTabIcon(activeTab), color = Color(0xFF9A6411), fontWeight = FontWeight.Bold)
                    }

                    Column(modifier = Modifier.padding(start = 10.dp).weight(1f)) {
                        Text(activeTab, color = ink, fontWeight = FontWeight.ExtraBold, fontSize = 14.sp)
                        Text("Administrateur", color = muted, fontSize = 11.sp)
                    }

                    Text("▾", color = muted, fontSize = 18.sp)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            if (tabs.isNotEmpty()) {
                Card(
                    modifier = Modifier.padding(horizontal = 18.dp),
                    colors = CardDefaults.cardColors(containerColor = card),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, border)
                ) {
                    Column(modifier = Modifier.padding(6.dp)) {
                        tabs.forEach { tab ->
                            val selected = tab == activeTab
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(11.dp))
                                    .background(if (selected) Color(0xFFFFF4D8) else Color.Transparent)
                                    .padding(horizontal = 12.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(getTabIcon(tab), color = if (selected) Color(0xFF9A6411) else muted, fontSize = 18.sp)
                                Spacer(modifier = Modifier.width(11.dp))
                                Text(tab, color = if (selected) Color(0xFF9A6411) else muted, fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.SemiBold, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }

            when (activeTab) {
                "Ventes" -> SalesScreen()
                "Stock" -> StockScreen()
                "Caisse" -> CashScreen()
                "Rapports" -> ReportsScreen()
                "Utilisateurs" -> UsersScreen()
                "Profil" -> ProfileScreen(onLogout = onLogout, user = user)
                else -> HomeScreen(user = user, onLogout = onLogout)
            }
        }

        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(horizontal = 18.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Box(modifier = Modifier.width(8.dp).height(8.dp).clip(CircleShape).background(Color(0xFF61BE9A)))
            Spacer(modifier = Modifier.width(7.dp))
            Text("Connecté : synchronisation prête", color = muted, fontSize = 10.sp)
        }
    }
}

@Composable
private fun HomeScreen(user: MockUser, onLogout: () -> Unit) {
    val accent = Color(0xFFF5B63F)
    val ink = Color(0xFF172033)
    val muted = Color(0xFF697386)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("TABLEAU DE BORD", color = Color(0xFFA26916), fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 1.2.sp)
                Text("Bonjour ${user.name} 👋", color = ink, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 6.dp))
                Text("Voici l'activité de ton entreprise.", color = muted, fontSize = 13.sp, modifier = Modifier.padding(top = 4.dp))
                Surface(
                    color = Color(0xFFFFF4D8),
                    shape = RoundedCornerShape(99.dp),
                    modifier = Modifier.padding(top = 9.dp)
                ) {
                    Text("${user.label}", modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp), color = Color(0xFF9A6411), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold)
                }
            }
            TextButton(onClick = onLogout) {
                Text("↪", color = muted, fontSize = 24.sp)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))
        Surface(color = Color(0xFFFFF4D8), shape = RoundedCornerShape(99.dp)) {
            Text("ESPACE AUTHENTIFIÉ · DONNÉES LOCALES", modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp), color = Color(0xFF9A6411), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.7.sp)
        }

        Spacer(modifier = Modifier.height(14.dp))
        Card(
            colors = CardDefaults.cardColors(containerColor = ink),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(modifier = Modifier.padding(22.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Chiffre d'affaires", color = Color(0xFFB8C0CE), fontSize = 13.sp)
                    Text("128 400 FC", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 7.dp))
                    Text("↗ 12,8 % ce mois", color = Color(0xFFF5C45D), fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 7.dp))
                }
                Box(modifier = Modifier.width(58.dp).height(58.dp).clip(RoundedCornerShape(18.dp)).background(Color(0xFF2C3548)), contentAlignment = Alignment.Center) {
                    Text("↗", color = accent, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(26.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Résumé du jour", color = ink, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold)
            Text("Aujourd'hui", color = muted, fontSize = 12.sp)
        }

        Spacer(modifier = Modifier.height(12.dp))
        val metrics = listOf(
            MetricItem("Ventes", "24", "+8,4 %", "gold"),
            MetricItem("Articles actifs", "186", "Stock stable", "blue"),
            MetricItem("Stock faible", "07", "À surveiller", "rose"),
            MetricItem("Caisse", "Ouverte", "Solde à jour", "green")
        )
        val rows = metrics.chunked(2)
        rows.forEach { pair ->
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                pair.forEach { metric ->
                    MetricCard(metric)
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
        }

        Spacer(modifier = Modifier.height(12.dp))
        Text("Actions rapides", color = ink, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold)
        Spacer(modifier = Modifier.height(12.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            QuickActionCard(label = "Nouvelle vente", symbol = "+", accent = "gold")
            QuickActionCard(label = "Ajouter un article", symbol = "□", accent = "blue")
        }
    }
}

@Composable
private fun SalesScreen() = PlaceholderScreen("VENTES", "Suivi des ventes", "Retrouve ici l’historique des ventes et les performances de ton activité.", "▣", "gold")

@Composable
private fun StockScreen() = PlaceholderScreen("STOCK", "Suivi du stock", "Surveille les articles actifs et les produits qui nécessitent ton attention.", "◈", "blue")

@Composable
private fun CashScreen() = PlaceholderScreen("CAISSE", "Suivi de la caisse", "Consulte l’état de la caisse et les mouvements financiers de la journée.", "$", "green")

@Composable
private fun ReportsScreen() = PlaceholderScreen("RAPPORTS", "Rapports d’activité", "Une vue synthétique des ventes, du stock et de la caisse de ton organisation.", "▥", "gold")

@Composable
private fun UsersScreen() = PlaceholderScreen("ADMINISTRATION", "Utilisateurs", "Administre les comptes, les rôles et les accès de ton organisation.", "♙", "blue")

@Composable
private fun ProfileScreen(onLogout: () -> Unit, user: MockUser) {
    PlaceholderScreen(
        eyebrow = "MON COMPTE",
        title = "Profil utilisateur",
        description = "Les informations de ton compte et les réglages seront disponibles ici.",
        symbol = "○",
        accent = "green",
        action = {
            Button(onClick = onLogout, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF5B63F), contentColor = Color(0xFF172033)), shape = RoundedCornerShape(14.dp)) {
                Text("Se déconnecter", fontWeight = FontWeight.ExtraBold)
            }
        }
    )
}

@Composable
private fun PlaceholderScreen(
    eyebrow: String,
    title: String,
    description: String,
    symbol: String,
    accent: String,
    action: (@Composable () -> Unit)? = null,
) {
    val ink = Color(0xFF172033)
    val muted = Color(0xFF697386)
    val card = Color.White
    val accentColor = when (accent) {
        "blue" -> Color(0xFF3D85C6)
        "gold" -> Color(0xFFA26916)
        else -> Color(0xFF328A68)
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        Box(
            modifier = Modifier
                .width(64.dp)
                .height(64.dp)
                .clip(RoundedCornerShape(22.dp))
                .background(card),
            contentAlignment = Alignment.Center
        ) {
            Text(symbol, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, color = accentColor)
        }

        Text(eyebrow, color = accentColor, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 1.2.sp, modifier = Modifier.padding(top = 22.dp))
        Text(title, color = ink, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 8.dp))
        Text(description, color = muted, fontSize = 14.sp, modifier = Modifier.padding(top = 8.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = card),
            shape = RoundedCornerShape(22.dp),
            modifier = Modifier.padding(top = 26.dp)
        ) {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                MetricRow("Ventes du jour", "24 commandes")
                MetricRow("Chiffre d’affaires", "128 400 FC")
                MetricRow("Panier moyen", "5 350 FC")
            }
        }

        Surface(
            color = Color(0xFFFFF4D8),
            shape = RoundedCornerShape(99.dp),
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("API À CONNECTER PLUS TARD", color = Color(0xFF9A6411), modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp), fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.7.sp)
        }

        if (action != null) {
            Spacer(modifier = Modifier.height(18.dp))
            action()
        }
    }
}

@Composable
private fun MetricRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 18.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = Color(0xFF697386), fontSize = 13.sp)
        Text(value, color = Color(0xFF172033), fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
    }
}

@Composable
private fun MetricCard(item: MetricItem) {
    val accent = when (item.tone) {
        "gold" -> Color(0xFFF5B63F)
        "blue" -> Color(0xFF61A8ED)
        "rose" -> Color(0xFFE47F86)
        else -> Color(0xFF61BE9A)
    }

    Card(
        modifier = Modifier.weight(1f),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(15.dp)) {
            Box(modifier = Modifier.width(9.dp).height(9.dp).clip(CircleShape).background(accent))
            Text(item.label, color = Color(0xFF697386), fontSize = 12.sp, modifier = Modifier.padding(top = 12.dp))
            Text(item.value, color = Color(0xFF172033), fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 5.dp))
            Text(item.detail, color = accent, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 5.dp))
        }
    }
}

@Composable
private fun QuickActionCard(label: String, symbol: String, accent: String) {
    val accentColor = if (accent == "blue") Color(0xFFE7F1FC) else Color(0xFFFFF4D8)
    val iconSize = 32.dp

    Card(
        modifier = Modifier.weight(1f),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Row(modifier = Modifier.padding(13.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(modifier = Modifier.width(iconSize).height(iconSize).clip(RoundedCornerShape(12.dp)).background(accentColor), contentAlignment = Alignment.Center) {
                Text(symbol, color = Color(0xFF172033), fontSize = 20.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(label, color = Color(0xFF172033), fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            Text("›", color = Color(0xFF697386), fontSize = 20.sp)
        }
    }
}

private fun getTabIcon(tab: String): String = when (tab) {
    "Accueil" -> "⌂"
    "Ventes" -> "🛒"
    "Stock" -> "▣"
    "Caisse" -> "$"
    "Rapports" -> "▤"
    "Utilisateurs" -> "👥"
    else -> "◉"
}

private data class MockUser(
    val email: String,
    val label: String,
    val name: String,
    val password: String,
    val role: String,
)

private data class MetricItem(
    val label: String,
    val value: String,
    val detail: String,
    val tone: String,
)

@Composable
private fun KitungaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = androidx.compose.material3.darkColorScheme(),
        content = content
    )
}
