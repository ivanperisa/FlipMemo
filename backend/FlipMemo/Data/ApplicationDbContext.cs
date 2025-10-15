using FlipMemo.Models;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Email)
                .HasMaxLength(320)
                .IsRequired();

            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Role)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.LastLogin)
                .IsRequired(false);

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            entity.Property(e => e.MustChangePassword)
                .IsRequired();
        });

        base.OnModelCreating(modelBuilder);
    }
}
