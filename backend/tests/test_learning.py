"""
Tests for the AI engine service (mocked Gemini calls).
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.services import ai_engine


def _mock_gemini_response(text: str):
    mock_resp = MagicMock()
    mock_resp.text = text
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock_resp
    return mock_model


class TestExplanation:
    @pytest.mark.asyncio
    async def test_generate_explanation_returns_correct_shape(self):
        json_text = '{"explanation": "A tree with at most two children.", "key_concepts": ["node", "leaf"], "suggested_next_levels": ["AVL Trees"]}'
        with patch("app.services.ai_engine._init_model", return_value=_mock_gemini_response(json_text)):
            result = await ai_engine.generate_explanation("Binary Trees", "simple")
        assert result.topic == "Binary Trees"
        assert result.level == "simple"
        assert "two children" in result.explanation
        assert "node" in result.key_concepts

    @pytest.mark.asyncio
    async def test_explanation_graceful_failure(self):
        mock_model = MagicMock()
        mock_model.generate_content.side_effect = Exception("API error")
        with patch("app.services.ai_engine._init_model", return_value=mock_model):
            result = await ai_engine.generate_explanation("Binary Trees", "simple")
        assert result.explanation != ""  # graceful fallback message


class TestQuizGeneration:
    @pytest.mark.asyncio
    async def test_generate_quiz_returns_questions(self):
        json_text = '''{
          "questions": [
            {
              "question": "What is a binary tree?",
              "options": [
                {"key": "A", "text": "A tree with two nodes"},
                {"key": "B", "text": "A tree where each node has at most 2 children"},
                {"key": "C", "text": "A sorted array"},
                {"key": "D", "text": "A graph with cycles"}
              ],
              "correct_key": "B",
              "explanation": "Each node has at most left and right children."
            }
          ]
        }'''
        with patch("app.services.ai_engine._init_model", return_value=_mock_gemini_response(json_text)):
            result = await ai_engine.generate_quiz("Binary Trees", "easy", 1)
        assert len(result.questions) == 1
        assert result.questions[0].question == "What is a binary tree?"
        assert len(result.questions[0].options) == 4


class TestEvaluation:
    @pytest.mark.asyncio
    async def test_correct_answer_scores_high(self):
        json_text = '{"score": 0.95, "is_correct": true, "feedback": "Excellent!", "correct_answer": "A binary tree has at most 2 children per node."}'
        with patch("app.services.ai_engine._init_model", return_value=_mock_gemini_response(json_text)):
            result = await ai_engine.evaluate_answer(
                question="What is a binary tree?",
                correct_answer="A binary tree has at most 2 children per node.",
                user_answer="Each node can have up to 2 children.",
                topic="Binary Trees",
            )
        assert result.score >= 0.7
        assert result.is_correct is True

    @pytest.mark.asyncio
    async def test_wrong_answer_scores_low(self):
        json_text = '{"score": 0.1, "is_correct": false, "feedback": "That is not correct.", "correct_answer": "A binary tree has at most 2 children per node."}'
        with patch("app.services.ai_engine._init_model", return_value=_mock_gemini_response(json_text)):
            result = await ai_engine.evaluate_answer(
                question="What is a binary tree?",
                correct_answer="A binary tree has at most 2 children per node.",
                user_answer="It is a linked list.",
                topic="Binary Trees",
            )
        assert result.score < 0.7
        assert result.is_correct is False


class TestLearningEndpoints:
    def test_explain_requires_auth(self, client):
        response = client.post("/api/v1/learning/explain", json={"topic": "Python", "level": "simple"})
        assert response.status_code == 403

    def test_quiz_requires_auth(self, client):
        response = client.post("/api/v1/learning/quiz", json={"topic": "Python"})
        assert response.status_code == 403

    def test_evaluate_requires_auth(self, client):
        response = client.post("/api/v1/learning/evaluate", json={
            "question": "q", "correct_answer": "a", "user_answer": "b", "topic": "t"
        })
        assert response.status_code == 403
