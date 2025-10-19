using FlipMemo.Models;
using Microsoft.EntityFrameworkCore;

namespace FlipMemo.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Dictionary> Dictionaries { get; set; }
    public DbSet<Word> Words { get; set; }
    public DbSet<Voice> Voices { get; set; }
    public DbSet<UserWord> UserWords { get; set; }
    public DbSet<DictionaryWord> DictionaryWords { get; set; }

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
        modelBuilder.Entity<Dictionary>(entity =>
        {
            entity.HasKey(d => d.Id);

            entity.Property(d => d.Name)
                .HasMaxLength(255);

            entity.Property(d => d.Language)
                .HasMaxLength(50);

            entity.HasMany(d => d.Words)
                .WithMany(w => w.Dictionaries)
                .UsingEntity<DictionaryWord>(
                    j => j.HasOne(dw => dw.Word)
                        .WithMany()
                        .HasForeignKey(dw => dw.WordId),
                    j => j.HasOne(dw => dw.Dictionary)
                        .WithMany()
                        .HasForeignKey(dw => dw.DictionaryId),
                    j => j.HasKey(t => new { t.DictionaryId, t.WordId })
                );
        });

        modelBuilder.Entity<Word>(entity =>
        {
            entity.HasKey(w => w.WordId);

            entity.Property(w => w.ForeignWord)
                .HasMaxLength(255);

            entity.Property(w => w.CroatianWord)
                .HasMaxLength(255);
        });

        modelBuilder.Entity<UserWord>(entity =>
        {
            entity.HasKey(uw => new { uw.UserId, uw.WordId });

            entity.HasOne(uw => uw.User)
                .WithMany(u => u.UserWords)
                .HasForeignKey(uw => uw.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(uw => uw.Word)
                .WithMany(w => w.UserWords)
                .HasForeignKey(uw => uw.WordId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Voice>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.HasOne(v => v.User)
                .WithMany(u => u.Voices)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(v => v.Word)
                .WithMany(w => w.Voices)
                .HasForeignKey(v => v.WordId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        base.OnModelCreating(modelBuilder);
    }
}
