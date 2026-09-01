//Express가 에러 미들웨어로 보려면 인자가 4개여야 한다.
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message || '서버 오류가 발생했습니다.',
    });
}

module.exports = errorHandler;