import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class PdfGenerator {
  static Future<Uint8List> _loadImage() async {
    final data = await rootBundle.load('assets/logo/xpose-logo.png');
    return data.buffer.asUint8List();
  }

  static Future<pw.Font> _loadFont() async {
    return pw.Font.ttf(
      await rootBundle.load("assets/fonts/NotoSans-Regular.ttf"),
    );
  }

  static Future<List<pw.Widget>> _buildFooter() async {
    final font = await _loadFont();
    return [
      pw.Divider(color: PdfColors.blue300, thickness: 1),
      pw.SizedBox(height: 20),
      pw.Text(
        "“Courage is contagious. When one person stands up,\nothers are empowered to do the same.”",
        textAlign: pw.TextAlign.center,
        style: pw.TextStyle(
          font: font,
          fontSize: 12,
          fontStyle: pw.FontStyle.italic,
          color: PdfColors.grey600,
        ),
      ),
      pw.SizedBox(height: 12),
      pw.Text(
        "— Nora Raleigh Baskin",
        textAlign: pw.TextAlign.center,
        style: pw.TextStyle(
          font: font,
          fontSize: 11,
          fontWeight: pw.FontWeight.bold,
          color: PdfColors.grey700,
        ),
      ),
      pw.SizedBox(height: 12),
      pw.Text(
        "Confidential Report Receipt",
        textAlign: pw.TextAlign.center,
        style: pw.TextStyle(
          font: font,
          fontSize: 10,
          color: PdfColors.grey500,
        ),
      ),
      pw.SizedBox(height: 20),
    ];
  }

  static Future<pw.Page> _buildReceiptPage(String reportId) async {
    final logoBytes = await _loadImage();
    final logo = pw.MemoryImage(logoBytes);
    final footer = await _buildFooter();

    return pw.Page(
      pageFormat: PdfPageFormat.a4,
      build: (pw.Context context) {
        return pw.Container(
          decoration: pw.BoxDecoration(
            border: pw.Border.all(color: PdfColors.blue800, width: 2),
            borderRadius: pw.BorderRadius.circular(10),
            color: PdfColors.white,
          ),
          margin: const pw.EdgeInsets.all(20),
          padding: const pw.EdgeInsets.all(30),
          child: pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            children: [
              pw.Container(
                width: 120,
                height: 120,
                child: pw.Image(logo, fit: pw.BoxFit.contain),
              ),
              pw.SizedBox(height: 25),
              pw.Text(
                "Xpose Report Receipt",
                style: pw.TextStyle(
                  fontSize: 26,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.blue900,
                ),
              ),
              pw.SizedBox(height: 35),
              pw.Divider(color: PdfColors.blue300, thickness: 1.5),
              pw.SizedBox(height: 25),
              pw.Text(
                "Report ID",
                style: pw.TextStyle(
                  fontSize: 18,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.grey700,
                ),
              ),
              pw.SizedBox(height: 10),
              pw.Text(
                reportId,
                style: pw.TextStyle(
                  fontSize: 22,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.green700,
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Text(
                "Date: ${DateTime.now().toLocal().toString().split('.')[0]}",
                style: pw.TextStyle(fontSize: 16, color: PdfColors.grey600),
              ),
              pw.SizedBox(height: 35),
              pw.Container(
                padding: const pw.EdgeInsets.all(20),
                decoration: pw.BoxDecoration(
                  color: PdfColors.blue50,
                  borderRadius: pw.BorderRadius.circular(10),
                ),
                child: pw.Text(
                  "Your report has been successfully submitted to Xpose. "
                      "This Report ID is your unique reference number for tracking purposes. "
                      "Please save this receipt for future reference.",
                  textAlign: pw.TextAlign.center,
                  style: pw.TextStyle(
                    fontSize: 14,
                    color: PdfColors.grey800,
                    lineSpacing: 1.8,
                  ),
                ),
              ),
              pw.Spacer(),
              ...footer,
            ],
          ),
        );
      },
    );
  }

  static Future<File> generateReportReceipt(String reportId) async {
    final pdf = pw.Document();
    final page = await _buildReceiptPage(reportId);
    pdf.addPage(page);

    final outputDir = await getApplicationDocumentsDirectory();
    final outputFile = File("${outputDir.path}/Xpose_Report_$reportId.pdf");
    await outputFile.writeAsBytes(await pdf.save());
    return outputFile;
  }

  static Future<void> shareReportReceipt(String reportId) async {
    final pdf = pw.Document();
    final page = await _buildReceiptPage(reportId);
    pdf.addPage(page);

    await Printing.sharePdf(
      bytes: await pdf.save(),
      filename: "Xpose_Report_$reportId.pdf",
    );
  }
}