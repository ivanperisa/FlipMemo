using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;

namespace FlipMemo.Utils;

public class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var response = new
        {
            message = context.Exception.Message
        };

        context.Result = context.Exception switch
        {
            ValidationException => new BadRequestObjectResult(response),
            UnauthorizedAccessException => new UnauthorizedObjectResult(response),
            NotFoundException => new NotFoundObjectResult(response),
            ConflictException => new ObjectResult(response) { StatusCode = (int)HttpStatusCode.Conflict },
            InvalidOperationException => new BadRequestObjectResult(response),
            _ => new ObjectResult(response) { StatusCode = (int)HttpStatusCode.InternalServerError }
        };

        context.ExceptionHandled = true;
    }
}
