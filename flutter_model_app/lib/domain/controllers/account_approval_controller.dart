import 'package:flutter/foundation.dart';
import '../../data/repositories/api_repository.dart';

class AccountApprovalEntry {
  final String code;
  final bool isApproved;

  const AccountApprovalEntry({
    required this.code,
    required this.isApproved,
  });
}

class AccountApprovalController with ChangeNotifier {
  final _apiRepository = ApiRepository();
  final List<String> _knownAccounts = const [
    'SM',
    'LJ',
    'BJ',
    'CS',
    'XC',
    'IL'
  ];

  List<AccountApprovalEntry> _accounts = [];
  bool _isLoading = false;
  String? _error;

  List<AccountApprovalEntry> get accounts => _accounts;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadApprovals(String modelId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiRepository.getAccountApproval(modelId);

      if (response['success'] == true) {
        final approvedList = (response['data']?['approvedAccounts'] as List?)
                ?.map((e) => e.toString())
                .toSet() ??
            <String>{};

        _accounts = _knownAccounts
            .map(
              (code) => AccountApprovalEntry(
                code: code,
                isApproved: approvedList.contains(code),
              ),
            )
            .toList();
      } else {
        _error = response['error'] ?? 'Failed to load account approvals';
        _accounts = _knownAccounts
            .map((code) => AccountApprovalEntry(code: code, isApproved: false))
            .toList();
      }
    } catch (e) {
      _error = e.toString();
      _accounts = _knownAccounts
          .map((code) => AccountApprovalEntry(code: code, isApproved: false))
          .toList();
    }

    _isLoading = false;
    notifyListeners();
  }

  void reset() {
    _accounts = [];
    _isLoading = false;
    _error = null;
    notifyListeners();
  }
}
