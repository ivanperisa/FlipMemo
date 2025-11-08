using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;

namespace FlipMemo.Utils;

public class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var response = new { message = context.Exception.Message };

        context.Result = context.Exception switch
        {
            ValidationException => new BadRequestObjectResult(response),
            InvalidOperationException => new BadRequestObjectResult(response),
            UnauthorizedAccessException => new UnauthorizedObjectResult(response) { StatusCode = (int)HttpStatusCode.Unauthorized },
            ForbiddenException => new ObjectResult(response) { StatusCode = (int)HttpStatusCode.Forbidden},
            NotFoundException => new NotFoundObjectResult(response) { StatusCode = (int)HttpStatusCode.NotFound },
            ConflictException => new ObjectResult(response) { StatusCode = (int)HttpStatusCode.Conflict },
            _ => new ObjectResult(response) { StatusCode = (int)HttpStatusCode.InternalServerError }
        };

        context.ExceptionHandled = true;
    }
}
