import 'dart:math';
import 'package:flutter/material.dart';
import '../widgets/italianno_text.dart';

class SplashView extends StatefulWidget {
  const SplashView({super.key});

  @override
  State<SplashView> createState() => _SplashViewState();
}

class _SplashViewState extends State<SplashView> with TickerProviderStateMixin {
  late AnimationController _imageController;
  late AnimationController _titleController;
  late Animation<double> _opacityAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _titleFadeAnimation;
  late String _randomImage;

  @override
  void initState() {
    super.initState();

    // Select random image from wlp directory
    final random = Random();
    final imageNumber = random.nextInt(4) + 1;
    _randomImage = 'assets/images/wlp/$imageNumber.png';

    // Image animation controller (3 seconds for image zoom + opacity)
    _imageController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    // Opacity animation: 15% to 45%
    _opacityAnimation = Tween<double>(begin: 0.15, end: 0.45).animate(
      CurvedAnimation(parent: _imageController, curve: Curves.easeInOut),
    );

    // Scale animation: zoom in effect
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _imageController, curve: Curves.easeInOut),
    );

    // Title animation controller (2.5 seconds, delayed by 0.5s)
    _titleController = AnimationController(
      duration: const Duration(milliseconds: 2500),
      vsync: this,
    );

    _titleFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _titleController, curve: Curves.easeIn),
    );

    // Start image animation
    _imageController.forward();

    // Start title animation after 500ms delay
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        _titleController.forward();
      }
    });

    // Redirect to login after animations complete (4 seconds total)
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/login');
      }
    });
  }

  @override
  void dispose() {
    _imageController.dispose();
    _titleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background with animated image
          AnimatedBuilder(
            animation: Listenable.merge([_opacityAnimation, _scaleAnimation]),
            builder: (context, child) {
              return Transform.scale(
                scale: _scaleAnimation.value,
                child: Container(
                  decoration: BoxDecoration(
                    image: DecorationImage(
                      image: AssetImage(_randomImage),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: Container(
                    color: Colors.black.withOpacity(_opacityAnimation.value),
                  ),
                ),
              );
            },
          ),

          // Title at bottom with fade animation
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: FadeTransition(
              opacity: _titleFadeAnimation,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 60, horizontal: 20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                      Colors.black.withOpacity(0.9),
                    ],
                  ),
                ),
                child: Center(
                  child: ItaliannoText(
                    'R Studio',
                    fontSize: 56,
                    color: Colors.white,
                    letterSpacing: 3,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
