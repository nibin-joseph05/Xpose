import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

class PdfGenerator {
  static Future<File> generateReportReceipt(String reportId) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Center(
            child: pw.Column(
              mainAxisSize: pw.MainAxisSize.min,
              children: [
                pw.Text(
                  "Xpose - Report Receipt",
                  style: pw.TextStyle(
                    fontSize: 24,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
                pw.SizedBox(height: 20),
                pw.Text("Report ID: $reportId",
                    style: pw.TextStyle(fontSize: 18)),
                pw.SizedBox(height: 10),
                pw.Text("Date: ${DateTime.now()}"),
                pw.SizedBox(height: 20),
                pw.Text(
                  "Keep this receipt safe.\nThe Report ID is the only way to track your report.",
                  textAlign: pw.TextAlign.center,
                  style: const pw.TextStyle(fontSize: 14),
                ),
              ],
            ),
          );
        },
      ),
    );

    final outputDir = await getApplicationDocumentsDirectory();
    final outputFile = File("${outputDir.path}/report_$reportId.pdf");
    await outputFile.writeAsBytes(await pdf.save());

    return outputFile;
  }

  static Future<void> shareReportReceipt(String reportId) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        build: (pw.Context context) => pw.Center(
          child: pw.Column(
            mainAxisSize: pw.MainAxisSize.min,
            children: [
              pw.Text(
                "Xpose - Report Receipt",
                style: pw.TextStyle(
                  fontSize: 24,
                  fontWeight: pw.FontWeight.bold,
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Text("Report ID: $reportId",
                  style: pw.TextStyle(fontSize: 18)),
              pw.SizedBox(height: 10),
              pw.Text("Date: ${DateTime.now()}"),
              pw.SizedBox(height: 20),
              pw.Text(
                "Keep this receipt safe.\nThe Report ID is the only way to track your report.",
                textAlign: pw.TextAlign.center,
                style: const pw.TextStyle(fontSize: 14),
              ),
            ],
          ),
        ),
      ),
    );

    await Printing.sharePdf(
      bytes: await pdf.save(),
      filename: "report_$reportId.pdf",
    );
  }
}