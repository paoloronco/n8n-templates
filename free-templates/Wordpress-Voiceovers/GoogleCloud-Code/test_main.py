import unittest
from unittest.mock import Mock, patch

import main
from fastapi import HTTPException


class LongTtsTests(unittest.TestCase):
    def setUp(self):
        main.API_KEY = "secret"
        main.BUCKET_NAME = "bucket"
        main.PROJECT_ID = "project"
        main.LOCATION = "global"

    def test_requires_valid_api_key(self):
        with self.assertRaises(HTTPException) as error:
            main._validate(main.TTSRequest(text="Ciao"), "wrong")
        self.assertEqual(error.exception.status_code, 401)

    def test_sanitizes_filename(self):
        self.assertEqual(main._filename("../post 42.wav"), "post-42.wav")

    def test_rejects_unsupported_location(self):
        main.LOCATION = "europe-west1"
        with self.assertRaises(HTTPException) as error:
            main._validate(main.TTSRequest(text="Ciao"), "secret")
        self.assertEqual(error.exception.status_code, 503)

    @patch.object(main.texttospeech_v1, "TextToSpeechLongAudioSynthesizeClient")
    def test_waits_for_synthesis_before_returning(self, client_class):
        operation = Mock()
        operation.operation.name = "operations/42"
        client_class.return_value.synthesize_long_audio.return_value = operation

        result = main.long_tts(
            main.TTSRequest(text="Ciao", filename="42.wav"),
            x_api_key="secret",
        )

        operation.result.assert_called_once_with(timeout=main.TTS_TIMEOUT_SECONDS)
        client_class.assert_called_once_with(client_options=None)
        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["gcs_uri"], "gs://bucket/42.wav")

    @patch.object(main.texttospeech_v1, "TextToSpeechLongAudioSynthesizeClient")
    def test_selects_matching_regional_endpoint(self, client_class):
        main.LOCATION = "eu"
        operation = Mock()
        operation.operation.name = "operations/43"
        client_class.return_value.synthesize_long_audio.return_value = operation

        main.long_tts(main.TTSRequest(text="Ciao"), x_api_key="secret")

        client_class.assert_called_once_with(
            client_options={"api_endpoint": "eu-texttospeech.googleapis.com"}
        )


if __name__ == "__main__":
    unittest.main()
