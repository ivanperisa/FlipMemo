namespace FlipMemo.Utils;

public class NotFoundException(string message) : Exception(message) { }

public class ConflictException(string message) : Exception(message) { }

public class ValidationException(string message) : Exception(message) { }

public class ForbiddenException(string message) : Exception(message) { }
