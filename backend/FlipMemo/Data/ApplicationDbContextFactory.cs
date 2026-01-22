//za rad s migracijama lokalno
//obrisati prije deploy
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FlipMemo.Data
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

            optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=FlipMemo;Username=postgres;Password=admin");

            return new ApplicationDbContext(optionsBuilder.Options);
        }
    }
}