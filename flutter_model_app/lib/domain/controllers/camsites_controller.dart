import 'package:flutter/foundation.dart';
import '../../data/repositories/api_repository.dart';

class CamSite {
  final String id;
  final String name;
  final String status;
  final String modelId;
  final String createdAt;
  final String updatedAt;

  CamSite({
    required this.id,
    required this.name,
    required this.status,
    required this.modelId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory CamSite.fromJson(Map<String, dynamic> json) {
    return CamSite(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      status: json['status'] ?? 'INACTIVE',
      modelId: json['modelId'] ?? '',
      createdAt: json['createdAt'] ?? '',
      updatedAt: json['updatedAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'status': status,
      'modelId': modelId,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class CamSitesController with ChangeNotifier {
  List<CamSite> _camSites = [];
  bool _isLoading = false;
  String? _error;

  final _apiRepository = ApiRepository();

  List<CamSite> get camSites => _camSites;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadCamSites(String modelId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiRepository.getCamSites(modelId);

      if (response['success'] == true && response['data'] != null) {
        final List<dynamic> data = response['data'];
        _camSites = data
            .map((item) => CamSite.fromJson(item as Map<String, dynamic>))
            .toList();
      } else {
        _error = response['error'] ?? 'Failed to load camera sites';
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('Failed to load camera sites: $e');
      }
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateCamSiteStatus(String siteId, String newStatus) async {
    try {
      final response =
          await _apiRepository.updateCamSiteStatus(siteId, newStatus);

      if (response['success'] == true) {
        // Update local list
        final index = _camSites.indexWhere((site) => site.id == siteId);
        if (index != -1) {
          final updatedSite = CamSite.fromJson(response['data']);
          _camSites[index] = updatedSite;
          notifyListeners();
        }
      } else {
        _error = response['error'] ?? 'Failed to update camera site';
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      if (kDebugMode) {
        print('Failed to update camera site status: $e');
      }
      notifyListeners();
    }
  }

  void reset() {
    _camSites = [];
    _isLoading = false;
    _error = null;
    notifyListeners();
  }
}
