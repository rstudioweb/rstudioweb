import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'domain/controllers/auth_controller.dart';
import 'domain/controllers/dashboard_controller.dart';
import 'domain/controllers/camsites_controller.dart';
import 'domain/controllers/theme_controller.dart';
import 'presentation/views/permission_view.dart';
import 'presentation/views/splash_view.dart';
import 'presentation/views/login_view.dart';
import 'presentation/views/dashboard_view.dart';
import 'presentation/views/notifications_view.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeController()),
        ChangeNotifierProvider(create: (_) => AuthController()),
        ChangeNotifierProvider(create: (_) => DashboardController()),
        ChangeNotifierProvider(create: (_) => CamSitesController()),
      ],
      child: Consumer<ThemeController>(
        builder: (context, themeController, _) {
          return MaterialApp(
            title: 'Model Dashboard',
            debugShowCheckedModeBanner: false,
            themeMode: themeController.themeMode,
            theme: AppTheme.lightTheme(),
            darkTheme: AppTheme.darkTheme(),
            initialRoute: '/',
            routes: {
              '/': (context) => const PermissionView(),
              '/splash': (context) => const SplashView(),
              '/login': (context) => const LoginView(),
              '/dashboard': (context) => const DashboardView(),
              '/notifications': (context) => const NotificationsView(),
            },
          );
        },
      ),
    );
  }
}
