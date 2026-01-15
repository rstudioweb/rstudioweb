import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';

class ItaliannoText extends StatelessWidget {
  final String text;
  final double fontSize;
  final Color? color;
  final TextAlign textAlign;
  final int maxLines;
  final TextOverflow overflow;
  final double letterSpacing;

  const ItaliannoText(
    this.text, {
    super.key,
    this.fontSize = 32,
    this.color,
    this.textAlign = TextAlign.center,
    this.maxLines = 3,
    this.overflow = TextOverflow.ellipsis,
    this.letterSpacing = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor =
        color ?? (isDark ? Colors.white : const Color(0xFF1F2937));

    return Text(
      text,
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow,
      style: TextStyle(
        fontFamily: AppConstants.fontItalianno,
        fontSize: fontSize,
        color: textColor,
        letterSpacing: letterSpacing,
        height: 1.2,
      ),
    );
  }
}
