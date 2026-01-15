class ModelProfile {
  final String id;
  final String username;
  final String name;
  final String email;
  final String phone;
  final String address;
  final String city;
  final String state;
  final String country;
  final String pincode;
  final DateTime createdAt;
  final DateTime updatedAt;

  ModelProfile({
    required this.id,
    required this.username,
    required this.name,
    required this.email,
    required this.phone,
    required this.address,
    required this.city,
    required this.state,
    required this.country,
    required this.pincode,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ModelProfile.fromJson(Map<String, dynamic> json) {
    return ModelProfile(
      id: json['id'] ?? '',
      username: json['username'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      country: json['country'] ?? '',
      pincode: json['pincode'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'name': name,
      'email': email,
      'phone': phone,
      'address': address,
      'city': city,
      'state': state,
      'country': country,
      'pincode': pincode,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class MPRData {
  final String id;
  final String modelId;
  final String month;
  final int mtgt;
  final int wkof;
  final int machv;

  MPRData({
    required this.id,
    required this.modelId,
    required this.month,
    required this.mtgt,
    required this.wkof,
    required this.machv,
  });

  factory MPRData.fromJson(Map<String, dynamic> json) {
    return MPRData(
      id: json['id'] ?? '',
      modelId: json['modelId'] ?? '',
      month: json['month'] ?? '',
      mtgt: json['mtgt'] ?? 0,
      wkof: json['wkof'] ?? 0,
      machv: json['machv'] ?? 0,
    );
  }
}

class DPRData {
  final String id;
  final String modelId;
  final String date;
  final int dachv;

  DPRData({
    required this.id,
    required this.modelId,
    required this.date,
    required this.dachv,
  });

  factory DPRData.fromJson(Map<String, dynamic> json) {
    return DPRData(
      id: json['id'] ?? '',
      modelId: json['modelId'] ?? '',
      date: json['date'] ?? '',
      dachv: json['dachv'] ?? 0,
    );
  }
}

class SessionData {
  final String date;
  final int totalSeconds;
  final List<Session> sessions;

  SessionData({
    required this.date,
    required this.totalSeconds,
    required this.sessions,
  });

  factory SessionData.fromJson(Map<String, dynamic> json) {
    return SessionData(
      date: json['date'] ?? '',
      totalSeconds: json['totalSeconds'] ?? 0,
      sessions:
          (json['sessions'] as List<dynamic>?)
              ?.map((s) => Session.fromJson(s))
              .toList() ??
          [],
    );
  }
}

class Session {
  final String? loginAt;
  final String? logoutAt;
  final int? seconds;
  final String? deviceId;
  final String? deviceName;

  Session({
    this.loginAt,
    this.logoutAt,
    this.seconds,
    this.deviceId,
    this.deviceName,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    return Session(
      loginAt: json['loginAt'],
      logoutAt: json['logoutAt'],
      seconds: json['seconds'],
      deviceId: json['deviceId'],
      deviceName: json['deviceName'],
    );
  }
}
