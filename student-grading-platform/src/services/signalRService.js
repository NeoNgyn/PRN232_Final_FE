/**
 * SignalR Service - Real-time communication with backend
 * 
 * Handles SignalR connection to receive real-time updates for:
 * - New submissions created
 * - Submissions updated (graded)
 */

import * as signalR from '@microsoft/signalr';
import { ACADEMIC_SERVICE_URL } from '../config/api';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize SignalR connection to SubmissionHub
   */
  async startConnection() {
    try {
      // Create connection with automatic reconnect
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${ACADEMIC_SERVICE_URL}/hubs/submissions`, {
          skipNegotiation: false, // Let SignalR negotiate transport
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
          accessTokenFactory: () => {
            // Add JWT token for authentication
            const token = localStorage.getItem('accessToken');
            return token || '';
          }
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            // Exponential backoff: 0s, 2s, 10s, 30s, 60s
            if (retryContext.previousRetryCount === 0) return 0;
            if (retryContext.previousRetryCount === 1) return 2000;
            if (retryContext.previousRetryCount === 2) return 10000;
            if (retryContext.previousRetryCount === 3) return 30000;
            return 60000;
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up connection event handlers
      this.connection.onclose(error => {
        console.log('SignalR connection closed', error);
        this.isConnected = false;
      });

      this.connection.onreconnecting(error => {
        console.log('SignalR reconnecting...', error);
        this.isConnected = false;
      });

      this.connection.onreconnected(connectionId => {
        console.log('SignalR reconnected. Connection ID:', connectionId);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      // Start connection
      await this.connection.start();
      this.isConnected = true;
      console.log('\u2705 SignalR connected successfully!');
      console.log('Connection ID:', this.connection.connectionId);
      console.log('Connection state:', this.connection.state);
      
      return true;
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.isConnected = false;
      
      // Retry connection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Retrying connection... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        setTimeout(() => this.startConnection(), 5000);
      }
      
      return false;
    }
  }

  /**
   * Stop SignalR connection
   */
  async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR connection stopped');
        this.isConnected = false;
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  /**
   * Subscribe to SubmissionCreated event
   * @param {Function} callback - Callback function to handle new submission
   */
  onSubmissionCreated(callback) {
    if (this.connection) {
      this.connection.on('SubmissionCreated', (submission) => {
        console.log('📥 SignalR: New submission created', submission);
        callback(submission);
      });
    }
  }

  /**
   * Subscribe to SubmissionUpdated event
   * @param {Function} callback - Callback function to handle updated submission
   */
  onSubmissionUpdated(callback) {
    if (this.connection) {
      this.connection.on('SubmissionUpdated', (submission) => {
        console.log('📥 SignalR: Submission updated', submission);
        callback(submission);
      });
    }
  }

  /**
   * Unsubscribe from SubmissionCreated event
   */
  offSubmissionCreated() {
    if (this.connection) {
      this.connection.off('SubmissionCreated');
    }
  }

  /**
   * Unsubscribe from SubmissionUpdated event
   */
  offSubmissionUpdated() {
    if (this.connection) {
      this.connection.off('SubmissionUpdated');
    }
  }

  /**
   * Check if connection is active
   */
  getConnectionState() {
    return this.connection?.state || 'Disconnected';
  }

  /**
   * Check if connected
   */
  isConnectionActive() {
    return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
