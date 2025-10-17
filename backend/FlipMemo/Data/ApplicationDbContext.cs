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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
{
    entity.ToTable("Users"); // 👈 Explicitly name the table

    entity.HasKey(e => e.Id);

    entity.Property(e => e.Username)
        .HasMaxLength(100)
        .IsRequired();

    entity.Property(e => e.Email)
        .HasMaxLength(320)
        .IsRequired();

    entity.Property(e => e.HashedPassword)
        .HasMaxLength(255)
        .IsRequired();

    entity.Property(e => e.Role)
        .HasMaxLength(50)
        .IsRequired();
    //entity.HasCheckConstraint("CK_User_Role", "Role IN ('Admin', 'User', 'RootAdmin')");
});

        modelBuilder.Entity<Dictionary>()
            .HasMany(d => d.Words)
            .WithMany(w => w.Dictionaries)
            .UsingEntity(j => j.ToTable("DictionaryWords"));

        modelBuilder.Entity<UserWord>(entity =>
        {
            entity.HasKey(e => e.UserWordId);

            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Word)
                  .WithMany()
                  .HasForeignKey(e => e.WordId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.Posuda)
                  .HasDefaultValue(1)
                  .IsRequired();

            entity.Property(e => e.LastReviewed)
                  .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.Learned)
                  .HasDefaultValue(false);
        });
        modelBuilder.Entity<Voice>(entity =>
        {
            entity.HasKey(e => e.VoiceId);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Word)
                .WithMany()
                .HasForeignKey(e => e.WordId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.Score)
                .IsRequired();

            entity.Property(e => e.LastReviewed)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        base.OnModelCreating(modelBuilder);
    }
}
