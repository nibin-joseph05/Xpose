import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:telephony/telephony.dart';
import 'dart:async';

class SosPage extends StatefulWidget {
  const SosPage({super.key});

  @override
  State<SosPage> createState() => _SosPageState();
}

class _SosPageState extends State<SosPage> {
  bool _sending = false;
  bool _completed = false;
  bool _failed = false;
  String _statusMessage = "Initializing SOS...";
  final String emergencyNumber = "+919778234876";
  final Telephony telephony = Telephony.instance;

  @override
  void initState() {
    super.initState();
    // Trigger SOS after UI is rendered
    WidgetsBinding.instance.addPostFrameCallback((_) => _triggerSos());
  }

  Future<void> _triggerSos() async {
    setState(() {
      _sending = true;
      _statusMessage = "Starting emergency protocol...";
    });

    try {
      // 1️⃣ Check location service
      if (!await Geolocator.isLocationServiceEnabled()) {
        _showError('Please enable location services');
        return;
      }

      // 2️⃣ Location permission
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        setState(() => _statusMessage = "Requesting location access...");
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showError('Location permission denied');
          return;
        }
      }

      // 3️⃣ Get current position
      setState(() => _statusMessage = "Getting your location...");
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // 4️⃣ Create message
      String message = "SOS! I need help. My location: https://maps.google.com/?q=${position.latitude},${position.longitude}";

      // 5️⃣ Request SMS permission
      setState(() => _statusMessage = "Requesting SMS permission...");
      bool? granted = await telephony.requestSmsPermissions;
      if (!(granted ?? false)) {
        _showError('SMS permission denied');
        return;
      }

      // 6️⃣ Send SMS
      setState(() => _statusMessage = "Sending emergency message...");
      await telephony.sendSms(to: emergencyNumber, message: message);

      // SUCCESS
      setState(() {
        _sending = false;
        _completed = true;
        _statusMessage = "SOS sent successfully! Help is on the way.";
      });

      // Close after 2 seconds
      _autoCloseOnSuccess();

    } catch (e) {
      _showError('Failed to send SOS: $e');
    }
  }

  void _showError(String error) {
    setState(() {
      _sending = false;
      _failed = true;
      _statusMessage = error;
    });
  }

  void _autoCloseOnSuccess() {
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        Navigator.of(context).pop();
      }
    });
  }

  void _closePage() {
    if (!_sending) {
      Navigator.of(context).pop();
    }
  }

  void _tryAgain() {
    setState(() {
      _sending = false;
      _completed = false;
      _failed = false;
      _statusMessage = "Initializing SOS...";
    });
    _triggerSos();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor: _failed ? Colors.orange[900] :
        _completed ? Colors.green[900] : Colors.red[900],
        body: SafeArea(
          child: Column(
            children: [
              // Header with close button (only when not sending)
              if (!_sending)
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: _closePage,
                      ),
                      Text(
                        _failed ? "SOS Failed" :
                        _completed ? "SOS Sent" : "EMERGENCY SOS",
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 48),
                    ],
                  ),
                ),

              // Main content
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Status Icon
                      if (_sending)
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            Container(
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                color: Colors.red[800],
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.emergency,
                                color: Colors.white,
                                size: 60,
                              ),
                            ),
                            const CircularProgressIndicator(
                              strokeWidth: 4,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          ],
                        )
                      else if (_completed)
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: Colors.green[800],
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.check_circle,
                            color: Colors.white,
                            size: 60,
                          ),
                        )
                      else if (_failed)
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              color: Colors.orange[800],
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.error,
                              color: Colors.white,
                              size: 60,
                            ),
                          ),

                      const SizedBox(height: 32),

                      // Status Message
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 32.0),
                        child: Text(
                          _statusMessage,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Additional info based on state
                      if (_sending)
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 32.0),
                          child: Text(
                            "Please wait... Do not close the app.\nYour location and emergency message are being sent.",
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        )
                      else if (_completed)
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 32.0),
                          child: Text(
                            "Help is on the way! This screen will close automatically.",
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        )
                      else if (_failed)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 32.0),
                            child: Column(
                              children: [
                                const Text(
                                  "The SOS message could not be sent.",
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 14,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: Colors.red[900],
                                  ),
                                  onPressed: _tryAgain,
                                  child: const Text("TRY AGAIN"),
                                ),
                              ],
                            ),
                          ),
                    ],
                  ),
                ),
              ),

              // Bottom safety information
              if (_sending)
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text(
                    "🚨 Emergency services are being notified 🚨",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}