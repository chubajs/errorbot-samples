<?php
// ErrorBot integration for PHP

class ErrorBot {
    private $apiKey;
    private $projectName;
    private $endpoint = 'https://errorbot.fyi/api/v1/report';

    public function __construct($apiKey, $projectName) {
        $this->apiKey = $apiKey;
        $this->projectName = $projectName;
    }

    public function init() {
        set_exception_handler([$this, 'handleException']);
        set_error_handler([$this, 'handleError']);
    }

    public function handleException($exception) {
        $this->reportError($exception->getMessage(), 'error');
    }

    public function handleError($errno, $errstr, $errfile, $errline) {
        $this->reportError("$errstr in $errfile on line $errline", 'error');
    }

    public function reportError($message, $type = 'error') {
        $errorData = [
            'message' => $message,
            'type' => $type,
            'project' => $this->projectName
        ];

        $ch = curl_init($this->endpoint);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($errorData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            "X-API-Key: {$this->apiKey}"
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        if (curl_errno($ch)) {
            error_log('Failed to report error to ErrorBot: ' . curl_error($ch));
        } else {
            $result = json_decode($response, true);
            if ($result['success']) {
                error_log('Error reported successfully');
            } else {
                error_log('Failed to report error: ' . $result['error']['message']);
            }
        }
        curl_close($ch);
    }
}

// Usage
$errorBot = new ErrorBot('YOUR_API_KEY_HERE', 'Your Project Name');
$errorBot->init();

// To manually report an error
// $errorBot->reportError('Something went wrong', 'warning');