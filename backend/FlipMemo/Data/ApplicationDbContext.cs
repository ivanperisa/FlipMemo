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
                .HasMaxLength(320);

            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255);

            entity.Property(e => e.Role)
                .HasMaxLength(50);

            entity.Property(e => e.SecurityStamp)
                .HasMaxLength(64);

            entity.Property(e => e.PasswordResetTokenHash)
                .HasMaxLength(255);
        });

        base.OnModelCreating(modelBuilder);
    }
}
