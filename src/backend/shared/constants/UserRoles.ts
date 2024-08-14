/**
 * This file defines the auth roles for the Igbo API Admin Platform
 */
enum UserRoles {
  /**
   * This role is for system administrators of the platform.
   * They essentially have sudo access to all abilities.
   *
   * Additionally, only they can approve new applications
   */
  ADMIN = 'admin',

  /**
   * Mergers can also make new suggestions
   */
  MERGER = 'merger',

  /**
   * Nsibidi merger can only make merging edits to Nsibidi characters
   */
  NSIBIDI_MERGER = 'nsibidi_merger',

  /**
   * Editors are people who make suggestions for new words or phrases
   * to be added to the API
   */
  EDITOR = 'editor',

  /**
   * Transcribers are people who only transcribe audio or record audio
   * for example sentences to be created annotated Igbo data
   */
  TRANSCRIBER = 'transcriber',

  /**
   * Crowdsourcers are people who only have access to crowdsourcing-specific
   * features
   */
  CROWDSOURCER = 'crowdsourcer',

  /**
   * Users are people who don't have any type of access to the platform
   * but are recognized by the application.
   */
  USER = 'user',
}

export default UserRoles;
