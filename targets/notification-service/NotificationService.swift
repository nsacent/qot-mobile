import UserNotifications

final class NotificationService: UNNotificationServiceExtension {
  private var contentHandler: ((UNNotificationContent) -> Void)?
  private var bestAttemptContent: UNMutableNotificationContent?

  override func didReceive(
    _ request: UNNotificationRequest,
    withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
  ) {
    self.contentHandler = contentHandler
    bestAttemptContent = request.content.mutableCopy() as? UNMutableNotificationContent

    guard let content = bestAttemptContent,
          let body = request.content.userInfo["body"] as? [String: Any],
          let richContent = body["_richContent"] as? [String: Any],
          let imageUrlString = richContent["image"] as? String,
          let imageUrl = URL(string: imageUrlString) else {
      contentHandler(bestAttemptContent ?? request.content)
      return
    }

    downloadAndAttachImage(url: imageUrl, to: content, completion: contentHandler)
  }

  private func downloadAndAttachImage(
    url: URL,
    to content: UNMutableNotificationContent,
    completion: @escaping (UNNotificationContent) -> Void
  ) {
    URLSession.shared.downloadTask(with: url) { temporaryFileLocation, response, _ in
      guard let temporaryFileLocation = temporaryFileLocation else {
        completion(content)
        return
      }

      let suggestedExtension = response?.suggestedFilename
        .flatMap { URL(fileURLWithPath: $0).pathExtension }
      let fileExtension = (suggestedExtension?.isEmpty == false) ? suggestedExtension! : "jpg"
      let targetUrl = URL(fileURLWithPath: NSTemporaryDirectory())
        .appendingPathComponent(UUID().uuidString)
        .appendingPathExtension(fileExtension)

      do {
        try FileManager.default.moveItem(at: temporaryFileLocation, to: targetUrl)
        content.attachments = [
          try UNNotificationAttachment(
            identifier: "qot-ad-cover",
            url: targetUrl,
            options: nil
          )
        ]
      } catch {
        // The notification text still appears when the image cannot be downloaded.
      }

      completion(content)
    }.resume()
  }

  override func serviceExtensionTimeWillExpire() {
    if let contentHandler, let bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }
}
