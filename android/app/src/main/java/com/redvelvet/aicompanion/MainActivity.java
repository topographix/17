package com.redvelvet.aicompanion;

import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;
import android.widget.LinearLayout;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.EditText;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.os.Handler;
import android.os.Looper;
import androidx.appcompat.app.AppCompatActivity;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity {
    private static final String TAG = "RedVelvet";
    private static final String SERVER_URL = "https://red-velvet-connection.replit.app";
    // For local testing: use "http://10.0.2.2:5000" for Android emulator
    // For production APK: use "https://red-velvet-connection.replit.app"
    private ExecutorService executor;
    private Handler mainHandler;
    private TextView statusText;
    private LinearLayout companionLayout;
    private int diamondCount = 25;
    private LinearLayout chatMessages;
    private EditText messageInput;
    private Button sendButton;
    private ScrollView chatScrollView;
    private int currentCompanionId = -1;
    private String currentCompanionName = "";
    private String guestSessionId = "";
    private String currentScreen = "home";
    private TextView diamondCounter;
    private LinearLayout mainContainer;
    private ScrollView contentScrollView;
    private LinearLayout contentLayout;
    private String deviceFingerprint = "";
    private String deviceId = "";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "RedVelvet - Complete GUI with Server Connection");
        
        // Initialize threading
        executor = Executors.newFixedThreadPool(4);
        mainHandler = new Handler(Looper.getMainLooper());
        
        // Generate device fingerprint for diamond tracking
        generateDeviceFingerprint();
        
        // Create interactive interface
        createInteractiveInterface();
        
        // Initialize device session for diamond tracking
        initializeDeviceSession();
        
        // Test server connection and sync diamonds
        testServerConnection();
    }
    
    private void createInteractiveInterface() {
        Log.d(TAG, "Creating complete RedVelvet interface with navigation");
        
        // Create main container with fixed header/footer layout (only once)
        if (mainContainer == null) {
            mainContainer = new LinearLayout(this);
            mainContainer.setOrientation(LinearLayout.VERTICAL);
            mainContainer.setBackgroundColor(0xFFE91E63);
            
            // Create fixed top header bar
            LinearLayout topHeader = createTopHeader();
            mainContainer.addView(topHeader);
            
            // Create scrollable content area
            contentScrollView = new ScrollView(this);
            contentLayout = new LinearLayout(this);
            contentLayout.setOrientation(LinearLayout.VERTICAL);
            contentLayout.setPadding(20, 15, 20, 15);
            
            contentScrollView.addView(contentLayout);
            
            // Set scroll view to fill remaining space
            LinearLayout.LayoutParams scrollParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1);
            contentScrollView.setLayoutParams(scrollParams);
            mainContainer.addView(contentScrollView);
            
            // Create fixed bottom navigation bar
            LinearLayout bottomNav = createBottomNavigation();
            mainContainer.addView(bottomNav);
            
            setContentView(mainContainer);
        }
        
        // Clear and rebuild content
        contentLayout.removeAllViews();
        
        // Status section
        statusText = new TextView(this);
        statusText.setText("🔄 Connecting to server...");
        statusText.setTextColor(0xFFFFFFFF);
        statusText.setTextSize(14);
        statusText.setGravity(Gravity.CENTER);
        statusText.setPadding(0, 0, 0, 20);
        contentLayout.addView(statusText);
        
        // Companions section
        TextView companionHeader = new TextView(this);
        companionHeader.setText("Available Companions:");
        companionHeader.setTextColor(0xFFFFFFFF);
        companionHeader.setTextSize(18);
        companionHeader.setGravity(Gravity.CENTER);
        companionHeader.setPadding(0, 0, 0, 20);
        contentLayout.addView(companionHeader);
        
        // Companion layout
        companionLayout = new LinearLayout(this);
        companionLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.addView(companionLayout);
        
        // Add default companions with profile images
        addCompanionWithImage("👩 Sophia - The Passionate", "A caring soul with deep brown eyes", 1);
        addCompanionWithImage("👩 Emma - The Caring", "Sweet and nurturing with a bright smile", 2);
        addCompanionWithImage("👩 Isabella - The Confident", "Strong and independent with piercing green eyes", 3);
        addCompanionWithImage("👨 James - The Romantic", "Charming gentleman with a warm heart", 4);
        addCompanionWithImage("👩 Alexa - The Playful", "Fun-loving spirit with infectious laughter", 5);
        
        // Update navigation buttons
        updateNavigationButtons();
        
        // Update diamond counter
        updateDiamondCount();
        
        Log.d(TAG, "Complete RedVelvet interface created successfully");
    }
    
    private LinearLayout createTopHeader() {
        LinearLayout headerLayout = new LinearLayout(this);
        headerLayout.setOrientation(LinearLayout.HORIZONTAL);
        headerLayout.setBackgroundColor(0xAA000000);
        headerLayout.setPadding(20, 45, 20, 15);
        headerLayout.setGravity(Gravity.CENTER_VERTICAL);
        
        // RedVelvet branding
        TextView brandText = new TextView(this);
        brandText.setText("RedVelvet");
        brandText.setTextColor(0xFFFFFFFF);
        brandText.setTextSize(22);
        brandText.setTypeface(null, android.graphics.Typeface.BOLD);
        LinearLayout.LayoutParams brandParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        brandText.setLayoutParams(brandParams);
        headerLayout.addView(brandText);
        
        // Diamond counter
        diamondCounter = new TextView(this);
        diamondCounter.setText("💎 " + diamondCount);
        diamondCounter.setTextColor(0xFFFFFFFF);
        diamondCounter.setTextSize(16);
        diamondCounter.setGravity(Gravity.CENTER);
        diamondCounter.setPadding(15, 5, 15, 5);
        diamondCounter.setBackgroundColor(0x44FFFFFF);
        diamondCounter.setOnClickListener(v -> updateDiamondCount());
        headerLayout.addView(diamondCounter);
        
        // Premium button
        Button premiumButton = new Button(this);
        premiumButton.setText("👑 Premium");
        premiumButton.setTextColor(0xFF000000);
        premiumButton.setTextSize(12);
        premiumButton.setBackgroundColor(0xFFFFD700);
        premiumButton.setPadding(15, 5, 15, 5);
        premiumButton.setOnClickListener(v -> showPremium());
        headerLayout.addView(premiumButton);
        
        return headerLayout;
    }
    
    private LinearLayout createBottomNavigation() {
        LinearLayout navLayout = new LinearLayout(this);
        navLayout.setOrientation(LinearLayout.HORIZONTAL);
        navLayout.setBackgroundColor(0xAA000000);
        navLayout.setPadding(10, 15, 10, 40);
        navLayout.setGravity(Gravity.CENTER);
        
        // Home Tab
        Button homeTab = createNavButton("🏠\nHome", "home");
        homeTab.setOnClickListener(v -> showHomeScreen());
        navLayout.addView(homeTab);
        
        // Chat Tab
        Button chatTab = createNavButton("💬\nChats", "chats");
        chatTab.setOnClickListener(v -> showChatHistory());
        navLayout.addView(chatTab);
        
        // Settings Tab
        Button settingsTab = createNavButton("⚙️\nSettings", "settings");
        settingsTab.setOnClickListener(v -> showSettings());
        navLayout.addView(settingsTab);
        
        // Premium Tab
        Button premiumTab = createNavButton("👑\nPremium", "premium");
        premiumTab.setOnClickListener(v -> showPremium());
        navLayout.addView(premiumTab);
        
        return navLayout;
    }
    
    private Button createNavButton(String text, String screen) {
        Button button = new Button(this);
        button.setText(text);
        button.setTextColor(currentScreen.equals(screen) ? 0xFFE91E63 : 0xAAFFFFFF);
        button.setTextSize(11);
        button.setBackgroundColor(currentScreen.equals(screen) ? 0x44FFFFFF : 0x00000000);
        button.setPadding(8, 8, 8, 8);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        params.setMargins(3, 0, 3, 0);
        button.setLayoutParams(params);
        
        return button;
    }
    
    private LinearLayout createTabNavigation() {
        LinearLayout tabLayout = new LinearLayout(this);
        tabLayout.setOrientation(LinearLayout.HORIZONTAL);
        tabLayout.setBackgroundColor(0x88000000);
        tabLayout.setPadding(0, 20, 0, 20);
        tabLayout.setGravity(Gravity.CENTER);
        
        // Home Tab
        Button homeTab = createTabButton("🏠 Home", "home");
        homeTab.setOnClickListener(v -> showHomeScreen());
        tabLayout.addView(homeTab);
        
        // Chat Tab
        Button chatTab = createTabButton("💬 Chats", "chats");
        chatTab.setOnClickListener(v -> showChatHistory());
        tabLayout.addView(chatTab);
        
        // Settings Tab
        Button settingsTab = createTabButton("⚙️ Settings", "settings");
        settingsTab.setOnClickListener(v -> showSettings());
        tabLayout.addView(settingsTab);
        
        // Premium Tab
        Button premiumTab = createTabButton("👑 Premium", "premium");
        premiumTab.setOnClickListener(v -> showPremium());
        tabLayout.addView(premiumTab);
        
        return tabLayout;
    }
    
    private Button createTabButton(String text, String screen) {
        Button tab = new Button(this);
        tab.setText(text);
        tab.setBackgroundColor(currentScreen.equals(screen) ? 0x88FFFFFF : 0x44FFFFFF);
        tab.setTextColor(0xFFE91E63);
        tab.setTextSize(12);
        tab.setPadding(15, 10, 15, 10);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        params.setMargins(5, 0, 5, 0);
        tab.setLayoutParams(params);
        
        return tab;
    }
    
    private void showHomeScreen() {
        currentScreen = "home";
        createInteractiveInterface();
        testServerConnection();
    }
    
    private void testServerConnection() {
        // Test connection to server and update status
        executor.execute(() -> {
            try {
                URL url = new URL(SERVER_URL + "/api/guest/session");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("User-Agent", "RedVelvet-Android/1.0");
                connection.setRequestProperty("X-Device-Fingerprint", deviceFingerprint);
                connection.setRequestProperty("X-Platform", "android");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(10000);
                
                int responseCode = connection.getResponseCode();
                
                mainHandler.post(() -> {
                    if (responseCode == 200) {
                        Log.d(TAG, "Server connection successful");
                        updateDiamondCount();
                    } else {
                        Log.w(TAG, "Server connection failed: " + responseCode);
                    }
                });
                
                connection.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Server connection error: " + e.getMessage());
                mainHandler.post(() -> {
                    // Continue with offline functionality
                });
            }
        });
    }
    
    private void showChatHistory() {
        currentScreen = "chats";
        createChatHistoryContent();
        updateNavigationButtons();
    }
    
    private void showSettings() {
        currentScreen = "settings";
        createSettingsContent();
        updateNavigationButtons();
    }
    
    private void showPremium() {
        currentScreen = "premium";
        createPremiumContent();
        updateNavigationButtons();
    }
    
    private void createChatHistoryContent() {
        // Clear and rebuild content
        contentLayout.removeAllViews();
        
        // Screen title
        TextView headerText = new TextView(this);
        headerText.setText("Chat History");
        headerText.setTextColor(0xFFFFFFFF);
        headerText.setTextSize(24);
        headerText.setGravity(Gravity.CENTER);
        headerText.setPadding(0, 0, 0, 30);
        contentLayout.addView(headerText);
        
        // Recent chats with profile images
        addChatHistoryItemWithImage(contentLayout, "👩 Sophia", "Hey there! How was your day?", "2 hours ago");
        addChatHistoryItemWithImage(contentLayout, "👩 Emma", "I missed talking with you!", "Yesterday");
        addChatHistoryItemWithImage(contentLayout, "👩 Isabella", "You always make me smile 😊", "2 days ago");
        addChatHistoryItemWithImage(contentLayout, "👨 James", "Looking forward to our next chat", "3 days ago");
        addChatHistoryItemWithImage(contentLayout, "👩 Alexa", "Ready for some fun? 😉", "1 week ago");
        
        // Clear history button
        Button clearButton = new Button(this);
        clearButton.setText("Clear All History");
        clearButton.setBackgroundColor(0x88FF0000);
        clearButton.setTextColor(0xFFFFFFFF);
        clearButton.setOnClickListener(v -> updateStatus("Chat history cleared!"));
        contentLayout.addView(clearButton);
    }
    
    private void addChatHistoryItem(LinearLayout parent, String companionName, String lastMessage, String time) {
        LinearLayout chatItem = new LinearLayout(this);
        chatItem.setOrientation(LinearLayout.VERTICAL);
        chatItem.setBackgroundColor(0x88FFFFFF);
        chatItem.setPadding(20, 15, 20, 15);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 10);
        chatItem.setLayoutParams(params);
        
        TextView nameText = new TextView(this);
        nameText.setText("💖 " + companionName);
        nameText.setTextColor(0xFFE91E63);
        nameText.setTextSize(16);
        nameText.setTypeface(null, android.graphics.Typeface.BOLD);
        chatItem.addView(nameText);
        
        TextView messageText = new TextView(this);
        messageText.setText(lastMessage);
        messageText.setTextColor(0xFF666666);
        messageText.setTextSize(14);
        chatItem.addView(messageText);
        
        TextView timeText = new TextView(this);
        timeText.setText(time);
        timeText.setTextColor(0xFF999999);
        timeText.setTextSize(12);
        chatItem.addView(timeText);
        
        parent.addView(chatItem);
    }
    
    private void createSettingsContent() {
        // Clear and rebuild content
        contentLayout.removeAllViews();
        
        // Screen title
        TextView headerText = new TextView(this);
        headerText.setText("Settings");
        headerText.setTextColor(0xFFFFFFFF);
        headerText.setTextSize(24);
        headerText.setGravity(Gravity.CENTER);
        headerText.setPadding(0, 0, 0, 30);
        contentLayout.addView(headerText);
        
        // Profile section with image
        addSettingsSection(contentLayout, "👤 Profile");
        addProfileSection(contentLayout);
        
        // Preferences section
        addSettingsSection(contentLayout, "💖 Preferences");
        addClickableSettingsItem(contentLayout, "Companion Gender", "Both Male & Female", "gender");
        addClickableSettingsItem(contentLayout, "Conversation Style", "Romantic & Caring", "style");
        addClickableSettingsItem(contentLayout, "Language", "English", "language");
        
        // App section
        addSettingsSection(contentLayout, "📱 App Settings");
        addClickableSettingsItem(contentLayout, "Notifications", "Enabled", "notifications");
        addClickableSettingsItem(contentLayout, "Dark Mode", "Disabled", "darkmode");
        addClickableSettingsItem(contentLayout, "Chat Backup", "Auto-save conversations", "backup");
        
        // About section
        addSettingsSection(contentLayout, "ℹ️ About");
        addSettingsItem(contentLayout, "Version", "RedVelvet Mobile v1.0");
        addClickableSettingsItem(contentLayout, "Privacy Policy", "View our privacy commitment", "privacy");
        addClickableSettingsItem(contentLayout, "Terms of Service", "Read terms and conditions", "terms");
    }
    
    private void createPremiumContent() {
        // Clear and rebuild content
        contentLayout.removeAllViews();
        
        // Screen title
        TextView headerText = new TextView(this);
        headerText.setText("Premium Features");
        headerText.setTextColor(0xFFFFD700);
        headerText.setTextSize(24);
        headerText.setGravity(Gravity.CENTER);
        headerText.setPadding(0, 0, 0, 30);
        contentLayout.addView(headerText);
        
        // Current diamonds
        TextView diamondsText = new TextView(this);
        diamondsText.setText("💎 Current Diamonds: " + diamondCount);
        diamondsText.setTextColor(0xFFFFFFFF);
        diamondsText.setTextSize(18);
        diamondsText.setGravity(Gravity.CENTER);
        diamondsText.setPadding(0, 0, 0, 30);
        contentLayout.addView(diamondsText);
        
        // Diamond packages
        addPremiumPackage("Starter Pack", "💎 100 Diamonds", "$2.99", "Perfect for getting started");
        addPremiumPackage("Popular Pack", "💎 500 Diamonds", "$9.99", "Most popular choice");
        addPremiumPackage("Premium Pack", "💎 1000 Diamonds", "$14.99", "Best value for money");
        addPremiumPackage("Ultimate Pack", "💎 2500 Diamonds", "$19.99", "Maximum savings");
        
        // Monthly subscription
        addSubscriptionPackage("Monthly Premium", "Unlimited Diamonds", "$14.99/month", "Cancel anytime");
    }
    
    private void updateNavigationButtons() {
        // This method will be called to refresh navigation button states
        // The createBottomNavigation method handles the button creation
        Log.d(TAG, "Navigation updated for screen: " + currentScreen);
    }
    
    private void updateDiamondCount() {
        // Make API call to get current diamond count
        executor.execute(() -> {
            try {
                URL url = new URL(SERVER_URL + "/api/guest/diamonds");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("User-Agent", "RedVelvet-Android");
                
                int responseCode = conn.getResponseCode();
                if (responseCode == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    String line;
                    StringBuilder response = new StringBuilder();
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    
                    // Parse diamond count from response
                    String responseStr = response.toString();
                    if (responseStr.contains("\"diamonds\":")) {
                        String diamondStr = responseStr.substring(responseStr.indexOf("\"diamonds\":") + 11);
                        diamondStr = diamondStr.substring(0, diamondStr.indexOf("}"));
                        diamondCount = Integer.parseInt(diamondStr);
                        
                        mainHandler.post(() -> {
                            if (diamondCounter != null) {
                                diamondCounter.setText("💎 " + diamondCount);
                            }
                            Log.d(TAG, "Diamond count updated: " + diamondCount);
                        });
                    }
                }
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Error updating diamond count: " + e.getMessage());
            }
        });
    }
    
    private void addCompanionWithImage(String name, String description, int companionId) {
        LinearLayout companionCard = new LinearLayout(this);
        companionCard.setOrientation(LinearLayout.HORIZONTAL);
        companionCard.setBackgroundColor(0x88FFFFFF);
        companionCard.setPadding(15, 15, 15, 15);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 10);
        companionCard.setLayoutParams(params);
        
        // Profile image placeholder
        TextView profileImage = new TextView(this);
        profileImage.setText(name.substring(0, 2)); // Get emoji
        profileImage.setTextSize(32);
        profileImage.setGravity(Gravity.CENTER);
        profileImage.setBackgroundColor(0x44FFFFFF);
        profileImage.setPadding(20, 15, 20, 15);
        
        LinearLayout.LayoutParams imageParams = new LinearLayout.LayoutParams(80, 80);
        imageParams.setMargins(0, 0, 15, 0);
        profileImage.setLayoutParams(imageParams);
        companionCard.addView(profileImage);
        
        // Info section
        LinearLayout infoLayout = new LinearLayout(this);
        infoLayout.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams infoParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        infoLayout.setLayoutParams(infoParams);
        
        TextView nameText = new TextView(this);
        nameText.setText(name);
        nameText.setTextColor(0xFFE91E63);
        nameText.setTextSize(16);
        nameText.setTypeface(null, android.graphics.Typeface.BOLD);
        infoLayout.addView(nameText);
        
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextColor(0xFF666666);
        descText.setTextSize(14);
        infoLayout.addView(descText);
        
        companionCard.addView(infoLayout);
        
        // Chat button
        Button chatButton = new Button(this);
        chatButton.setText("Chat");
        chatButton.setBackgroundColor(0xFFE91E63);
        chatButton.setTextColor(0xFFFFFFFF);
        chatButton.setOnClickListener(v -> selectCompanion(companionId, name));
        companionCard.addView(chatButton);
        
        companionLayout.addView(companionCard);
    }
    
    private void addChatHistoryItemWithImage(LinearLayout parent, String companionName, String lastMessage, String time) {
        LinearLayout chatItem = new LinearLayout(this);
        chatItem.setOrientation(LinearLayout.HORIZONTAL);
        chatItem.setBackgroundColor(0x88FFFFFF);
        chatItem.setPadding(15, 15, 15, 15);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 10);
        chatItem.setLayoutParams(params);
        
        // Profile image
        TextView profileImage = new TextView(this);
        profileImage.setText(companionName.substring(0, 2)); // Get emoji
        profileImage.setTextSize(24);
        profileImage.setGravity(Gravity.CENTER);
        profileImage.setBackgroundColor(0x44FFFFFF);
        profileImage.setPadding(15, 10, 15, 10);
        
        LinearLayout.LayoutParams imageParams = new LinearLayout.LayoutParams(60, 60);
        imageParams.setMargins(0, 0, 15, 0);
        profileImage.setLayoutParams(imageParams);
        chatItem.addView(profileImage);
        
        // Message info
        LinearLayout messageLayout = new LinearLayout(this);
        messageLayout.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams messageParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        messageLayout.setLayoutParams(messageParams);
        
        TextView nameText = new TextView(this);
        nameText.setText(companionName);
        nameText.setTextColor(0xFFE91E63);
        nameText.setTextSize(16);
        nameText.setTypeface(null, android.graphics.Typeface.BOLD);
        messageLayout.addView(nameText);
        
        TextView messageText = new TextView(this);
        messageText.setText(lastMessage);
        messageText.setTextColor(0xFF666666);
        messageText.setTextSize(14);
        messageLayout.addView(messageText);
        
        TextView timeText = new TextView(this);
        timeText.setText(time);
        timeText.setTextColor(0xFF999999);
        timeText.setTextSize(12);
        messageLayout.addView(timeText);
        
        chatItem.addView(messageLayout);
        parent.addView(chatItem);
    }
    
    private void addProfileSection(LinearLayout parent) {
        LinearLayout profileCard = new LinearLayout(this);
        profileCard.setOrientation(LinearLayout.HORIZONTAL);
        profileCard.setBackgroundColor(0x88FFFFFF);
        profileCard.setPadding(20, 20, 20, 20);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 15);
        profileCard.setLayoutParams(params);
        
        // Profile image
        TextView profileImage = new TextView(this);
        profileImage.setText("👤");
        profileImage.setTextSize(48);
        profileImage.setGravity(Gravity.CENTER);
        profileImage.setBackgroundColor(0x44FFFFFF);
        profileImage.setPadding(20, 15, 20, 15);
        
        LinearLayout.LayoutParams imageParams = new LinearLayout.LayoutParams(100, 100);
        imageParams.setMargins(0, 0, 20, 0);
        profileImage.setLayoutParams(imageParams);
        profileCard.addView(profileImage);
        
        // Profile info
        LinearLayout infoLayout = new LinearLayout(this);
        infoLayout.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams infoParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        infoLayout.setLayoutParams(infoParams);
        
        TextView nameText = new TextView(this);
        nameText.setText("Guest User");
        nameText.setTextColor(0xFFE91E63);
        nameText.setTextSize(18);
        nameText.setTypeface(null, android.graphics.Typeface.BOLD);
        infoLayout.addView(nameText);
        
        TextView statusText = new TextView(this);
        statusText.setText("💎 " + diamondCount + " Diamonds");
        statusText.setTextColor(0xFF666666);
        statusText.setTextSize(14);
        infoLayout.addView(statusText);
        
        TextView registerText = new TextView(this);
        registerText.setText("Tap to register for more features");
        registerText.setTextColor(0xFF999999);
        registerText.setTextSize(12);
        infoLayout.addView(registerText);
        
        profileCard.addView(infoLayout);
        parent.addView(profileCard);
    }
    
    private void addClickableSettingsItem(LinearLayout parent, String title, String description, String action) {
        LinearLayout settingItem = new LinearLayout(this);
        settingItem.setOrientation(LinearLayout.VERTICAL);
        settingItem.setBackgroundColor(0x88FFFFFF);
        settingItem.setPadding(20, 15, 20, 15);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 5);
        settingItem.setLayoutParams(params);
        
        TextView titleText = new TextView(this);
        titleText.setText(title);
        titleText.setTextColor(0xFFE91E63);
        titleText.setTextSize(16);
        titleText.setTypeface(null, android.graphics.Typeface.BOLD);
        settingItem.addView(titleText);
        
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextColor(0xFF666666);
        descText.setTextSize(14);
        settingItem.addView(descText);
        
        settingItem.setOnClickListener(v -> handleSettingClick(action, title));
        parent.addView(settingItem);
    }
    
    private void addPremiumPackage(String title, String diamonds, String price, String description) {
        LinearLayout packageCard = new LinearLayout(this);
        packageCard.setOrientation(LinearLayout.VERTICAL);
        packageCard.setBackgroundColor(0x88FFFFFF);
        packageCard.setPadding(20, 20, 20, 20);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 15);
        packageCard.setLayoutParams(params);
        
        TextView titleText = new TextView(this);
        titleText.setText(title);
        titleText.setTextColor(0xFFE91E63);
        titleText.setTextSize(18);
        titleText.setTypeface(null, android.graphics.Typeface.BOLD);
        titleText.setGravity(Gravity.CENTER);
        packageCard.addView(titleText);
        
        TextView diamondText = new TextView(this);
        diamondText.setText(diamonds);
        diamondText.setTextColor(0xFFFFD700);
        diamondText.setTextSize(24);
        diamondText.setGravity(Gravity.CENTER);
        diamondText.setPadding(0, 10, 0, 10);
        packageCard.addView(diamondText);
        
        TextView priceText = new TextView(this);
        priceText.setText(price);
        priceText.setTextColor(0xFF666666);
        priceText.setTextSize(16);
        priceText.setGravity(Gravity.CENTER);
        packageCard.addView(priceText);
        
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextColor(0xFF999999);
        descText.setTextSize(14);
        descText.setGravity(Gravity.CENTER);
        descText.setPadding(0, 5, 0, 15);
        packageCard.addView(descText);
        
        Button buyButton = new Button(this);
        buyButton.setText("Purchase");
        buyButton.setBackgroundColor(0xFFE91E63);
        buyButton.setTextColor(0xFFFFFFFF);
        buyButton.setOnClickListener(v -> updateStatus("Purchase feature coming soon!"));
        packageCard.addView(buyButton);
        
        contentLayout.addView(packageCard);
    }
    
    private void addSubscriptionPackage(String title, String diamonds, String price, String description) {
        LinearLayout packageCard = new LinearLayout(this);
        packageCard.setOrientation(LinearLayout.VERTICAL);
        packageCard.setBackgroundColor(0x88FFD700);
        packageCard.setPadding(20, 20, 20, 20);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 15);
        packageCard.setLayoutParams(params);
        
        TextView titleText = new TextView(this);
        titleText.setText("👑 " + title);
        titleText.setTextColor(0xFF000000);
        titleText.setTextSize(18);
        titleText.setTypeface(null, android.graphics.Typeface.BOLD);
        titleText.setGravity(Gravity.CENTER);
        packageCard.addView(titleText);
        
        TextView diamondText = new TextView(this);
        diamondText.setText(diamonds);
        diamondText.setTextColor(0xFFE91E63);
        diamondText.setTextSize(24);
        diamondText.setGravity(Gravity.CENTER);
        diamondText.setPadding(0, 10, 0, 10);
        packageCard.addView(diamondText);
        
        TextView priceText = new TextView(this);
        priceText.setText(price);
        priceText.setTextColor(0xFF666666);
        priceText.setTextSize(16);
        priceText.setGravity(Gravity.CENTER);
        packageCard.addView(priceText);
        
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextColor(0xFF999999);
        descText.setTextSize(14);
        descText.setGravity(Gravity.CENTER);
        descText.setPadding(0, 5, 0, 15);
        packageCard.addView(descText);
        
        Button subscribeButton = new Button(this);
        subscribeButton.setText("Subscribe");
        subscribeButton.setBackgroundColor(0xFFE91E63);
        subscribeButton.setTextColor(0xFFFFFFFF);
        subscribeButton.setOnClickListener(v -> updateStatus("Subscription feature coming soon!"));
        packageCard.addView(subscribeButton);
        
        contentLayout.addView(packageCard);
    }
    
    private void handleSettingClick(String action, String title) {
        switch (action) {
            case "gender":
                updateStatus("Gender preference: Currently set to 'Both'");
                break;
            case "style":
                updateStatus("Conversation style: Currently set to 'Romantic & Caring'");
                break;
            case "language":
                updateStatus("Language: Currently set to 'English'");
                break;
            case "notifications":
                updateStatus("Notifications: Currently enabled");
                break;
            case "darkmode":
                updateStatus("Dark mode: Currently disabled");
                break;
            case "backup":
                updateStatus("Chat backup: Auto-save enabled");
                break;
            case "privacy":
                updateStatus("Privacy Policy: View at redvelvet.com/privacy");
                break;
            case "terms":
                updateStatus("Terms of Service: View at redvelvet.com/terms");
                break;
            default:
                updateStatus("Settings option: " + title);
        }
    }
    
    private void addSettingsSection(LinearLayout parent, String title) {
        TextView sectionTitle = new TextView(this);
        sectionTitle.setText(title);
        sectionTitle.setTextColor(0xFFFFFFFF);
        sectionTitle.setTextSize(18);
        sectionTitle.setTypeface(null, android.graphics.Typeface.BOLD);
        sectionTitle.setPadding(0, 20, 0, 10);
        parent.addView(sectionTitle);
    }
    
    private void addSettingsItem(LinearLayout parent, String title, String description) {
        LinearLayout settingItem = new LinearLayout(this);
        settingItem.setOrientation(LinearLayout.VERTICAL);
        settingItem.setBackgroundColor(0x88FFFFFF);
        settingItem.setPadding(20, 15, 20, 15);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 5);
        settingItem.setLayoutParams(params);
        
        TextView titleText = new TextView(this);
        titleText.setText(title);
        titleText.setTextColor(0xFFE91E63);
        titleText.setTextSize(16);
        titleText.setTypeface(null, android.graphics.Typeface.BOLD);
        settingItem.addView(titleText);
        
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextColor(0xFF666666);
        descText.setTextSize(14);
        settingItem.addView(descText);
        
        parent.addView(settingItem);
    }
    
    private void createPremiumScreen() {
        // Create main container with fixed header/footer layout
        LinearLayout mainContainer = new LinearLayout(this);
        mainContainer.setOrientation(LinearLayout.VERTICAL);
        mainContainer.setBackgroundColor(0xFFE91E63);
        
        // Create fixed top header bar
        LinearLayout topHeader = createTopHeader();
        mainContainer.addView(topHeader);
        
        // Create scrollable content area
        ScrollView scrollView = new ScrollView(this);
        LinearLayout contentLayout = new LinearLayout(this);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setPadding(20, 20, 20, 20);
        
        // Screen title
        TextView headerText = new TextView(this);
        headerText.setText("👑 Premium Features");
        headerText.setTextColor(0xFFFFFFFF);
        headerText.setTextSize(24);
        headerText.setGravity(Gravity.CENTER);
        headerText.setPadding(0, 0, 0, 20);
        contentLayout.addView(headerText);
        
        TextView subText = new TextView(this);
        subText.setText("Unlock unlimited conversations and exclusive companions!");
        subText.setTextColor(0xFFFFFFFF);
        subText.setTextSize(16);
        subText.setGravity(Gravity.CENTER);
        subText.setPadding(0, 0, 0, 30);
        contentLayout.addView(subText);
        
        // Current status
        TextView statusText = new TextView(this);
        statusText.setText("Current: Guest User\n💎 " + diamondCount + " Diamonds Remaining");
        statusText.setTextColor(0xFFFFFFFF);
        statusText.setTextSize(14);
        statusText.setGravity(Gravity.CENTER);
        statusText.setBackgroundColor(0x44000000);
        statusText.setPadding(20, 15, 20, 15);
        contentLayout.addView(statusText);
        
        // Diamond packages
        TextView diamondHeader = new TextView(this);
        diamondHeader.setText("💎 Buy Diamonds");
        diamondHeader.setTextColor(0xFFFFFFFF);
        diamondHeader.setTextSize(20);
        diamondHeader.setTypeface(null, android.graphics.Typeface.BOLD);
        diamondHeader.setPadding(0, 30, 0, 15);
        contentLayout.addView(diamondHeader);
        
        addDiamondPackage(contentLayout, "Starter Pack", "100 Diamonds", "$2.99", "Perfect for trying out premium features");
        addDiamondPackage(contentLayout, "Popular Pack", "500 Diamonds", "$9.99", "Great value for regular users");
        addDiamondPackage(contentLayout, "Premium Pack", "1200 Diamonds", "$19.99", "Best value for power users");
        
        // Subscription
        TextView subHeader = new TextView(this);
        subHeader.setText("🔄 Monthly Subscription");
        subHeader.setTextColor(0xFFFFFFFF);
        subHeader.setTextSize(20);
        subHeader.setTypeface(null, android.graphics.Typeface.BOLD);
        subHeader.setPadding(0, 30, 0, 15);
        contentLayout.addView(subHeader);
        
        addSubscriptionPlan(contentLayout, "Premium Monthly", "$14.99/month", "✅ Unlimited messages\n✅ All companions\n✅ Priority support\n✅ No ads");
        
        // Features section
        TextView featuresHeader = new TextView(this);
        featuresHeader.setText("🌟 Premium Benefits");
        featuresHeader.setTextColor(0xFFFFFFFF);
        featuresHeader.setTextSize(20);
        featuresHeader.setTypeface(null, android.graphics.Typeface.BOLD);
        featuresHeader.setPadding(0, 30, 0, 15);
        contentLayout.addView(featuresHeader);
        
        addFeatureItem(contentLayout, "🔓 Unlock All Companions", "Access to exclusive premium companions");
        addFeatureItem(contentLayout, "📱 Image Generation", "Generate custom companion photos");
        addFeatureItem(contentLayout, "💬 Unlimited Messages", "No diamond restrictions");
        addFeatureItem(contentLayout, "⚡ Priority Responses", "Faster AI response times");
        addFeatureItem(contentLayout, "🎨 Customization", "Personalize companion appearance");
        
        scrollView.addView(contentLayout);
        
        // Set scroll view to fill remaining space
        LinearLayout.LayoutParams scrollParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, 0, 1);
        scrollView.setLayoutParams(scrollParams);
        mainContainer.addView(scrollView);
        
        // Create fixed bottom navigation bar
        LinearLayout bottomNav = createBottomNavigation();
        mainContainer.addView(bottomNav);
        
        setContentView(mainContainer);
    }
    
    private void addDiamondPackage(LinearLayout parent, String title, String diamonds, String price, String description) {
        LinearLayout packageItem = new LinearLayout(this);
        packageItem.setOrientation(LinearLayout.VERTICAL);
        packageItem.setBackgroundColor(0x88FFFFFF);
        packageItem.setPadding(20, 15, 20, 15);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 10);
        packageItem.setLayoutParams(params);
        
        LinearLayout headerLayout = new LinearLayout(this);
        headerLayout.setOrientation(LinearLayout.HORIZONTAL);
        
        TextView titleText = new TextView(this);
        titleText.setText(title + " - " + diamonds);
        titleText.setTextColor(0xFFE91E63);
        titleText.setTextSize(16);
        titleText.setTypeface(null, android.graphics.Typeface.BOLD);
        headerLayout.addView(titleText);
        
        TextView priceText = new TextView(this);
        priceText.setText(price);
        priceText.setTextColor(0xFF00AA00);
        priceText.setTextSize(16);
        priceText.setTypeface(null, android.graphics.Typeface.BOLD);
        priceText.setGravity(Gravity.END);
        LinearLayout.LayoutParams priceParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        priceText.setLayoutParams(priceParams);
        headerLayout.addView(priceText);
        
        packageItem.addView(headerLayout);
        
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextColor(0xFF666666);
        descText.setTextSize(14);
        packageItem.addView(descText);
        
        Button buyButton = new Button(this);
        buyButton.setText("Purchase");
        buyButton.setBackgroundColor(0xFFE91E63);
        buyButton.setTextColor(0xFFFFFFFF);
        buyButton.setOnClickListener(v -> updateStatus("Purchase initiated for " + title));
        packageItem.addView(buyButton);
        
        parent.addView(packageItem);
    }
    
    private void addSubscriptionPlan(LinearLayout parent, String title, String price, String features) {
        LinearLayout planItem = new LinearLayout(this);
        planItem.setOrientation(LinearLayout.VERTICAL);
        planItem.setBackgroundColor(0x88FFD700);
        planItem.setPadding(20, 15, 20, 15);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 10);
        planItem.setLayoutParams(params);
        
        TextView titleText = new TextView(this);
        titleText.setText(title);
        titleText.setTextColor(0xFFE91E63);
        titleText.setTextSize(18);
        titleText.setTypeface(null, android.graphics.Typeface.BOLD);
        planItem.addView(titleText);
        
        TextView priceText = new TextView(this);
        priceText.setText(price);
        priceText.setTextColor(0xFF00AA00);
        priceText.setTextSize(16);
        priceText.setTypeface(null, android.graphics.Typeface.BOLD);
        planItem.addView(priceText);
        
        TextView featuresText = new TextView(this);
        featuresText.setText(features);
        featuresText.setTextColor(0xFF333333);
        featuresText.setTextSize(14);
        planItem.addView(featuresText);
        
        Button subscribeButton = new Button(this);
        subscribeButton.setText("Subscribe Now");
        subscribeButton.setBackgroundColor(0xFFE91E63);
        subscribeButton.setTextColor(0xFFFFFFFF);
        subscribeButton.setOnClickListener(v -> updateStatus("Subscription initiated for " + title));
        planItem.addView(subscribeButton);
        
        parent.addView(planItem);
    }
    
    private void addFeatureItem(LinearLayout parent, String title, String description) {
        LinearLayout featureItem = new LinearLayout(this);
        featureItem.setOrientation(LinearLayout.VERTICAL);
        featureItem.setBackgroundColor(0x44FFFFFF);
        featureItem.setPadding(15, 10, 15, 10);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 5);
        featureItem.setLayoutParams(params);
        
        TextView titleText = new TextView(this);
        titleText.setText(title);
        titleText.setTextColor(0xFFFFFFFF);
        titleText.setTextSize(16);
        titleText.setTypeface(null, android.graphics.Typeface.BOLD);
        featureItem.addView(titleText);
        
        TextView descText = new TextView(this);
        descText.setText(description);
        descText.setTextColor(0xFFCCCCCC);
        descText.setTextSize(14);
        featureItem.addView(descText);
        
        parent.addView(featureItem);
    }
    
    private void addCompanionButton(String text, int companionId) {
        Button companionButton = new Button(this);
        companionButton.setText(text);
        companionButton.setBackgroundColor(0x88FFFFFF);
        companionButton.setTextColor(0xFFE91E63);
        companionButton.setTextSize(16);
        companionButton.setPadding(20, 20, 20, 20);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(0, 0, 0, 15);
        companionButton.setLayoutParams(params);
        
        companionButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                selectCompanion(companionId, text);
            }
        });
        
        companionLayout.addView(companionButton);
    }
    
    private void selectCompanion(int companionId, String companionName) {
        Log.d(TAG, "Companion selected: " + companionName + " (ID: " + companionId + ")");
        updateStatus("Selected: " + companionName);
        
        // Create chat interface
        createChatInterface(companionId, companionName);
    }
    
    private void updateStatus(String message) {
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                statusText.setText(message);
            }
        });
    }
    
    private void generateDeviceFingerprint() {
        try {
            // Generate unique device fingerprint using device info
            android.provider.Settings.Secure.getString(getContentResolver(), 
                android.provider.Settings.Secure.ANDROID_ID);
            
            // Create fingerprint from multiple device characteristics
            String androidId = android.provider.Settings.Secure.getString(getContentResolver(), 
                android.provider.Settings.Secure.ANDROID_ID);
            String model = android.os.Build.MODEL;
            String manufacturer = android.os.Build.MANUFACTURER;
            String brand = android.os.Build.BRAND;
            
            String rawFingerprint = androidId + "_" + model + "_" + manufacturer + "_" + brand;
            deviceFingerprint = android.util.Base64.encodeToString(rawFingerprint.getBytes(), 
                android.util.Base64.NO_WRAP);
            deviceId = deviceFingerprint;
            
            Log.d(TAG, "Generated device fingerprint: " + deviceFingerprint.substring(0, 8) + "...");
            
        } catch (Exception e) {
            Log.e(TAG, "Error generating device fingerprint: " + e.getMessage());
            // Fallback to simple fingerprint
            deviceFingerprint = "android_" + System.currentTimeMillis();
            deviceId = deviceFingerprint;
        }
    }
    
    private void initializeDeviceSession() {
        Log.d(TAG, "Initializing device session for diamond tracking");
        
        executor.execute(() -> {
            try {
                URL url = new URL(SERVER_URL + "/api/mobile/device-session");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("User-Agent", "RedVelvet-Android/1.0");
                connection.setRequestProperty("X-Device-Fingerprint", deviceFingerprint);
                connection.setRequestProperty("X-Platform", "android");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);
                
                int responseCode = connection.getResponseCode();
                Log.d(TAG, "Device session response code: " + responseCode);
                
                if (responseCode == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    
                    String responseText = response.toString();
                    Log.d(TAG, "Device session response: " + responseText);
                    
                    // Parse diamond count from device session
                    String diamondsStr = extractJsonValue(responseText, "messageDiamonds");
                    String hasReceivedWelcome = extractJsonValue(responseText, "hasReceivedWelcomeDiamonds");
                    
                    try {
                        int serverDiamonds = Integer.parseInt(diamondsStr);
                        boolean welcomeReceived = Boolean.parseBoolean(hasReceivedWelcome);
                        
                        mainHandler.post(() -> {
                            diamondCount = serverDiamonds;
                            updateDiamondDisplay();
                            
                            if (welcomeReceived) {
                                updateStatus("✅ Device registered! " + diamondCount + " diamonds available");
                            } else {
                                updateStatus("🎉 Welcome! You received 25 diamonds!");
                            }
                        });
                    } catch (NumberFormatException e) {
                        Log.e(TAG, "Error parsing diamond count: " + diamondsStr);
                        mainHandler.post(() -> updateStatus("❌ Diamond tracking error"));
                    }
                } else {
                    Log.e(TAG, "Device session failed with code: " + responseCode);
                    mainHandler.post(() -> updateStatus("❌ Device registration failed"));
                }
                
                connection.disconnect();
                
            } catch (IOException e) {
                Log.e(TAG, "Device session error: " + e.getMessage());
                mainHandler.post(() -> updateStatus("❌ Device session unreachable"));
            }
        });
    }
    
    private void createChatInterface(int companionId, String companionName) {
        Log.d(TAG, "Creating chat interface for: " + companionName);
        
        currentCompanionId = companionId;
        currentCompanionName = companionName;
        
        // Create chat layout with proper Android system bar spacing
        LinearLayout chatLayout = new LinearLayout(this);
        chatLayout.setOrientation(LinearLayout.VERTICAL);
        chatLayout.setBackgroundColor(0xFFE91E63);
        // Add padding for Android status bar (top) and navigation (bottom)
        // Bottom bar needs 2-3mm more = 8-12px additional = 124px total
        chatLayout.setPadding(20, 92, 20, 124);
        
        // Chat header
        LinearLayout headerLayout = new LinearLayout(this);
        headerLayout.setOrientation(LinearLayout.HORIZONTAL);
        headerLayout.setGravity(Gravity.CENTER_VERTICAL);
        headerLayout.setPadding(0, 0, 0, 20);
        
        Button backButton = new Button(this);
        backButton.setText("← Back");
        backButton.setBackgroundColor(0x88FFFFFF);
        backButton.setTextColor(0xFFE91E63);
        backButton.setOnClickListener(v -> {
            // FIXED: Return to home screen immediately without crashes
            Log.d(TAG, "Chat back button pressed - returning to home");
            currentScreen = "home";
            currentCompanionId = -1;
            currentCompanionName = "";
            
            // Clear chat state
            if (chatMessages != null) {
                chatMessages.removeAllViews();
                chatMessages = null;
            }
            if (chatScrollView != null) {
                chatScrollView.removeAllViews();
                chatScrollView = null;
            }
            
            // Force refresh diamond count
            fetchDiamondCount();
            
            // CRITICAL FIX: Recreate complete interface from scratch
            setContentView(null); // Clear everything
            createInteractiveInterface(); // Rebuild home screen
            Log.d(TAG, "Successfully returned to home screen");
        });
        
        TextView headerTitle = new TextView(this);
        headerTitle.setText("💖 " + companionName);
        headerTitle.setTextColor(0xFFFFFFFF);
        headerTitle.setTextSize(18);
        headerTitle.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams headerParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        headerTitle.setLayoutParams(headerParams);
        
        diamondCounter = new TextView(this);
        diamondCounter.setText("💎 " + diamondCount);
        diamondCounter.setTextColor(0xFFFFFFFF);
        diamondCounter.setTextSize(16);
        
        // Fetch current diamond count from server when entering chat
        fetchDiamondCount();
        
        headerLayout.addView(backButton);
        headerLayout.addView(headerTitle);
        headerLayout.addView(diamondCounter);
        
        // Chat messages area
        chatScrollView = new ScrollView(this);
        chatScrollView.setBackgroundColor(0x88FFFFFF);
        chatScrollView.setPadding(10, 10, 10, 10);
        
        chatMessages = new LinearLayout(this);
        chatMessages.setOrientation(LinearLayout.VERTICAL);
        chatScrollView.addView(chatMessages);
        
        // Welcome message
        addMessage("Hello! I'm " + companionName + ". How can I make your day better?", false);
        
        // Input area
        LinearLayout inputLayout = new LinearLayout(this);
        inputLayout.setOrientation(LinearLayout.HORIZONTAL);
        inputLayout.setPadding(10, 10, 10, 10);
        inputLayout.setGravity(Gravity.CENTER_VERTICAL);
        
        messageInput = new EditText(this);
        messageInput.setHint("Type your message...");
        messageInput.setTextSize(16);
        messageInput.setBackgroundColor(0xFFFFFFFF);
        messageInput.setPadding(15, 15, 15, 15);
        
        LinearLayout.LayoutParams inputParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1);
        inputParams.setMargins(0, 0, 10, 0);
        messageInput.setLayoutParams(inputParams);
        
        sendButton = new Button(this);
        sendButton.setText("Send");
        sendButton.setBackgroundColor(0xFFE91E63);
        sendButton.setTextColor(0xFFFFFFFF);
        sendButton.setOnClickListener(v -> {
            String message = messageInput.getText().toString().trim();
            if (!message.isEmpty()) {
                sendChatMessage(message);
                messageInput.setText("");
            }
        });
        
        inputLayout.addView(messageInput);
        inputLayout.addView(sendButton);
        
        // Layout setup
        LinearLayout.LayoutParams scrollParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, 0, 1);
        chatScrollView.setLayoutParams(scrollParams);
        
        chatLayout.addView(headerLayout);
        chatLayout.addView(chatScrollView);
        chatLayout.addView(inputLayout);
        
        setContentView(chatLayout);
        
        Log.d(TAG, "Chat interface created for: " + companionName);
    }
    
    private void addMessage(String message, boolean isUser) {
        TextView messageView = new TextView(this);
        messageView.setText(message);
        messageView.setTextSize(16);
        messageView.setPadding(15, 10, 15, 10);
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(10, 5, 10, 5);
        
        if (isUser) {
            messageView.setBackgroundColor(0xFFE91E63);
            messageView.setTextColor(0xFFFFFFFF);
            params.gravity = Gravity.END;
        } else {
            messageView.setBackgroundColor(0xFFFFFFFF);
            messageView.setTextColor(0xFF333333);
            params.gravity = Gravity.START;
        }
        
        messageView.setLayoutParams(params);
        chatMessages.addView(messageView);
        
        // Scroll to bottom
        chatScrollView.post(() -> chatScrollView.fullScroll(View.FOCUS_DOWN));
    }
    
    private void addTypingIndicator() {
        TextView typingView = new TextView(this);
        typingView.setText("💖 " + currentCompanionName + " is typing...");
        typingView.setTextSize(14);
        typingView.setTextColor(0xFF666666);
        typingView.setPadding(15, 10, 15, 10);
        typingView.setTag("typing");
        
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(10, 5, 10, 5);
        params.gravity = Gravity.START;
        typingView.setLayoutParams(params);
        
        chatMessages.addView(typingView);
        chatScrollView.post(() -> chatScrollView.fullScroll(View.FOCUS_DOWN));
    }
    
    private void removeTypingIndicator() {
        for (int i = chatMessages.getChildCount() - 1; i >= 0; i--) {
            View child = chatMessages.getChildAt(i);
            if ("typing".equals(child.getTag())) {
                chatMessages.removeView(child);
                break;
            }
        }
    }
    
    private void updateDiamondDisplay() {
        Log.d(TAG, "Updating diamond display to: " + diamondCount);
        if (diamondCounter != null) {
            diamondCounter.setText("💎 " + diamondCount);
        }
        
        // Also update main interface diamond counter if it exists
        if (mainContainer != null) {
            for (int i = 0; i < mainContainer.getChildCount(); i++) {
                View child = mainContainer.getChildAt(i);
                if (child instanceof LinearLayout) {
                    LinearLayout layout = (LinearLayout) child;
                    for (int j = 0; j < layout.getChildCount(); j++) {
                        View subChild = layout.getChildAt(j);
                        if (subChild instanceof TextView) {
                            TextView textView = (TextView) subChild;
                            if (textView.getText().toString().startsWith("💎")) {
                                textView.setText("💎 " + diamondCount);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    
    private void sendChatMessage(String message) {
        Log.d(TAG, "ANDROID CHAT START - Companion ID: " + currentCompanionId + ", Message: " + message.substring(0, Math.min(20, message.length())) + "...");
        Log.d(TAG, "ANDROID CHAT START - Device fingerprint: " + deviceFingerprint.substring(0, Math.min(10, deviceFingerprint.length())) + "...");
        Log.d(TAG, "ANDROID CHAT START - Server URL: " + SERVER_URL);
        
        addMessage(message, true);
        addTypingIndicator();
        
        executor.execute(() -> {
            try {
                // First get/create guest session if needed
                if (guestSessionId.isEmpty()) {
                    Log.d(TAG, "ANDROID CHAT - Getting guest session first...");
                    getGuestSession();
                }
                
                // Send chat message using guest endpoint (fixed for Android)
                URL url = new URL(SERVER_URL + "/api/guest/chat");
                Log.d(TAG, "ANDROID CHAT - Connecting to: " + url.toString());
                
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("User-Agent", "RedVelvet-Android/1.0");
                connection.setRequestProperty("X-Device-Fingerprint", deviceFingerprint);
                connection.setRequestProperty("X-Platform", "android");
                connection.setConnectTimeout(10000); // 10 second timeout
                connection.setReadTimeout(15000); // 15 second timeout
                connection.setDoOutput(true);
                
                String jsonPayload = String.format(
                    "{\"companionId\": %d, \"message\": \"%s\"}",
                    currentCompanionId, message.replace("\"", "\\\"")
                );
                
                Log.d(TAG, "ANDROID CHAT - Sending request: " + jsonPayload);
                
                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = jsonPayload.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }
                
                int responseCode = connection.getResponseCode();
                Log.d(TAG, "Android chat API response code: " + responseCode);
                
                if (responseCode == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    
                    String responseText = response.toString();
                    Log.d(TAG, "ANDROID CHAT SUCCESS - Full response: " + responseText);
                    Log.d(TAG, "ANDROID CHAT SUCCESS - Response length: " + responseText.length());
                    
                    // Parse AI response and updated diamond count
                    if (responseText.contains("\"response\":")) {
                        String aiResponse = extractJsonValue(responseText, "response");
                        String diamondsStr = extractJsonValue(responseText, "remainingDiamonds");
                        
                        Log.d(TAG, "Received AI response: " + aiResponse.substring(0, Math.min(50, aiResponse.length())) + "...");
                        Log.d(TAG, "Updated diamond count: " + diamondsStr);
                        
                        mainHandler.post(() -> {
                            removeTypingIndicator();
                            addMessage(aiResponse, false);
                            
                            // Update diamond count from server response
                            try {
                                int serverDiamonds = Integer.parseInt(diamondsStr);
                                diamondCount = serverDiamonds;
                                updateDiamondDisplay();
                                Log.d(TAG, "Updated diamond count after message: " + diamondCount);
                            } catch (NumberFormatException e) {
                                Log.e(TAG, "Error parsing diamond count: " + diamondsStr);
                                // Fallback: fetch diamond count from server
                                fetchDiamondCount();
                            }
                        });
                    } else {
                        Log.e(TAG, "No response field found in: " + responseText);
                        mainHandler.post(() -> {
                            removeTypingIndicator();
                            addMessage("❌ No response received from AI", false);
                        });
                    }
                } else {
                    Log.e(TAG, "ANDROID CHAT FAILED - Response code: " + responseCode);
                    Log.e(TAG, "ANDROID CHAT FAILED - Server URL: " + SERVER_URL + "/api/guest/chat");
                    
                    // Read error response
                    BufferedReader errorReader = new BufferedReader(new InputStreamReader(connection.getErrorStream()));
                    StringBuilder errorResponse = new StringBuilder();
                    String errorLine;
                    while ((errorLine = errorReader.readLine()) != null) {
                        errorResponse.append(errorLine);
                    }
                    errorReader.close();
                    
                    Log.e(TAG, "Error response: " + errorResponse.toString());
                    
                    mainHandler.post(() -> {
                        removeTypingIndicator();
                        if (responseCode == 402) {
                            addMessage("❌ Not enough diamonds! Please purchase more diamonds to continue.", false);
                        } else {
                            addMessage("❌ Failed to send message. Please try again.", false);
                        }
                    });
                }
                
                connection.disconnect();
                
            } catch (Exception e) {
                Log.e(TAG, "ANDROID CHAT EXCEPTION: " + e.getMessage());
                Log.e(TAG, "ANDROID CHAT EXCEPTION: " + e.getClass().getSimpleName());
                e.printStackTrace();
                mainHandler.post(() -> {
                    removeTypingIndicator();
                    addMessage("❌ Network error. Please check your connection.", false);
                });
            }
        });
    }
    
    private void getGuestSession() {
        try {
            URL url = new URL(SERVER_URL + "/api/guest/session");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "RedVelvet-Android/1.0");
            
            int responseCode = connection.getResponseCode();
            if (responseCode == 200) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                String responseText = response.toString();
                guestSessionId = extractJsonValue(responseText, "sessionId");
                Log.d(TAG, "Guest session ID: " + guestSessionId);
            }
            
            connection.disconnect();
        } catch (Exception e) {
            Log.e(TAG, "Error getting guest session: " + e.getMessage());
        }
    }
    
    private void fetchDiamondCount() {
        executor.execute(() -> {
            try {
                URL url = new URL(SERVER_URL + "/api/mobile/diamonds");
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("User-Agent", "RedVelvet-Android/1.0");
                connection.setRequestProperty("X-Device-Fingerprint", deviceFingerprint);
                connection.setRequestProperty("X-Platform", "android");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);
                
                int responseCode = connection.getResponseCode();
                Log.d(TAG, "Diamond fetch response code: " + responseCode + " for device: " + deviceFingerprint.substring(0, 8) + "...");
                
                if (responseCode == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    
                    String responseText = response.toString();
                    Log.d(TAG, "Diamond fetch response: " + responseText);
                    String diamondsStr = extractJsonValue(responseText, "diamonds");
                    
                    try {
                        int serverDiamonds = Integer.parseInt(diamondsStr);
                        mainHandler.post(() -> {
                            diamondCount = serverDiamonds;
                            updateDiamondDisplay();
                            Log.d(TAG, "Synced diamond count from server: " + diamondCount + " for device: " + deviceFingerprint.substring(0, 8) + "...");
                        });
                    } catch (NumberFormatException e) {
                        Log.e(TAG, "Error parsing diamond count: " + diamondsStr);
                    }
                } else {
                    Log.e(TAG, "Failed to fetch diamonds, response code: " + responseCode);
                }
                
                connection.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Error fetching diamond count: " + e.getMessage());
            }
        });
    }
    
    private String extractJsonValue(String jsonString, String key) {
        try {
            String searchKey = "\"" + key + "\"";
            int keyIndex = jsonString.indexOf(searchKey);
            if (keyIndex == -1) return "";
            
            int colonIndex = jsonString.indexOf(":", keyIndex);
            if (colonIndex == -1) return "";
            
            int valueStart = colonIndex + 1;
            while (valueStart < jsonString.length() && 
                   (jsonString.charAt(valueStart) == ' ' || jsonString.charAt(valueStart) == '\t')) {
                valueStart++;
            }
            
            if (valueStart >= jsonString.length()) return "";
            
            char firstChar = jsonString.charAt(valueStart);
            if (firstChar == '"') {
                // String value
                int valueEnd = jsonString.indexOf('"', valueStart + 1);
                if (valueEnd == -1) return "";
                return jsonString.substring(valueStart + 1, valueEnd);
            } else {
                // Number or boolean value
                int valueEnd = valueStart;
                while (valueEnd < jsonString.length() && 
                       jsonString.charAt(valueEnd) != ',' && 
                       jsonString.charAt(valueEnd) != '}' && 
                       jsonString.charAt(valueEnd) != ']') {
                    valueEnd++;
                }
                return jsonString.substring(valueStart, valueEnd).trim();
            }
        } catch (Exception e) {
            Log.e(TAG, "Error extracting JSON value for key: " + key);
            return "";
        }
    }
    
    @Override
    public void onBackPressed() {
        Log.d(TAG, "Back button pressed");
        
        // FIXED: If in chat, go directly to home screen
        if ("chat".equals(currentScreen)) {
            Log.d(TAG, "System back button: returning from chat to home");
            currentScreen = "home";
            currentCompanionId = -1;
            currentCompanionName = "";
            
            // Clear all chat state
            if (chatMessages != null) {
                chatMessages.removeAllViews();
                chatMessages = null;
            }
            if (chatScrollView != null) {
                chatScrollView.removeAllViews(); 
                chatScrollView = null;
            }
            
            // Force complete interface rebuild to home screen
            setContentView(null);
            createInteractiveInterface();
            Log.d(TAG, "System back: Successfully returned to home");
        } else {
            Log.d(TAG, "Back button: exiting app");
            super.onBackPressed(); // Default back behavior (exit app)
        }
    }
    
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null) {
            executor.shutdown();
        }
    }
}
